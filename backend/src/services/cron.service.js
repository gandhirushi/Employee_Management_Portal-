import cron from "node-cron";
import prisma from "../prisma/client.js";
import { sendGoodMorningEmail } from "./email.service.js";

// Concurrency mutex flag to avoid overlapping runs
let isJobRunning = false;

/**
 * Execute the daily Good Morning email batch job.
 * Fetches all active employees with valid email addresses, deduplicates,
 * and sends personalized emails while logging execution details.
 * @returns {Promise<{ success: boolean, totalFound: number, uniqueRecipients: number, sentCount: number, failedCount: number, skippedCount: number, durationMs: number }>}
 */
export async function sendDailyGoodMorningEmails() {
  if (isJobRunning) {
    console.warn("[Cron:GoodMorning] Scheduled job is already running. Skipping concurrent execution.");
    return {
      success: false,
      reason: "Job already in progress",
    };
  }

  isJobRunning = true;
  const startTime = Date.now();
  console.log(`[Cron:GoodMorning] Starting daily "Good Morning" email task at ${new Date().toISOString()}...`);

  let totalFound = 0;
  let uniqueRecipients = 0;
  let sentCount = 0;
  let failedCount = 0;
  let skippedCount = 0;
  const failedDetails = [];

  try {
    // 1. Fetch active employees from database
    const activeEmployees = await prisma.employee.findMany({
      where: {
        status: {
          equals: "Active",
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        status: true,
      },
    });

    totalFound = activeEmployees.length;

    // 2. Filter valid emails and deduplicate within this run
    const seenEmails = new Set();
    const targetEmployees = [];

    for (const emp of activeEmployees) {
      if (!emp.email || typeof emp.email !== "string") {
        skippedCount++;
        continue;
      }

      const normalizedEmail = emp.email.trim().toLowerCase();
      if (!normalizedEmail.includes("@")) {
        skippedCount++;
        continue;
      }

      // Check duplicate within the same run
      if (seenEmails.has(normalizedEmail)) {
        console.log(`[Cron:GoodMorning] Duplicate email detected in run for ${normalizedEmail}. Skipping.`);
        skippedCount++;
        continue;
      }

      seenEmails.add(normalizedEmail);
      targetEmployees.push({
        id: emp.id,
        fullName: emp.fullName,
        email: normalizedEmail,
      });
    }

    uniqueRecipients = targetEmployees.length;
    console.log(
      `[Cron:GoodMorning] Query returned ${totalFound} active employees. Queued ${uniqueRecipients} unique recipient(s) for email dispatch.`
    );

    // 3. Batch process emails with individual error handling
    for (const emp of targetEmployees) {
      try {
        const result = await sendGoodMorningEmail({
          to: emp.email,
          fullName: emp.fullName,
        });

        if (result.sent) {
          sentCount++;
        } else if (result.skipped) {
          skippedCount++;
          console.log(`[Cron:GoodMorning] Email skipped for ${emp.email}: ${result.reason || "SMTP skipped"}`);
        } else {
          failedCount++;
          failedDetails.push({
            email: emp.email,
            error: result.error || "Unknown dispatch failure",
          });
        }
      } catch (singleErr) {
        failedCount++;
        failedDetails.push({
          email: emp.email,
          error: singleErr.message || "Execution exception",
        });
        console.error(`[Cron:GoodMorning] Exception sending email to ${emp.email}:`, singleErr.message);
      }
    }
  } catch (dbErr) {
    console.error("[Cron:GoodMorning] Critical error fetching active employees from database:", dbErr.message);
  } finally {
    isJobRunning = false;
    const durationMs = Date.now() - startTime;

    console.log(
      `[Cron:GoodMorning] Completed daily task in ${durationMs}ms | Total Active: ${totalFound} | Unique Recipients: ${uniqueRecipients} | Sent: ${sentCount} | Failed: ${failedCount} | Skipped: ${skippedCount}`
    );

    if (failedCount > 0) {
      console.warn(`[Cron:GoodMorning] ${failedCount} email(s) failed to send:`, JSON.stringify(failedDetails, null, 2));
    }
  }

  return {
    success: true,
    totalFound,
    uniqueRecipients,
    sentCount,
    failedCount,
    skippedCount,
    durationMs: Date.now() - startTime,
  };
}

/**
 * Initialize all application cron jobs.
 * Schedules the daily "Good Morning" email job for 10:00 AM in the configured timezone.
 */
export function initCronJobs() {
  // Default to 10:00 AM daily ('0 10 * * *')
  const cronSchedule = process.env.GOOD_MORNING_CRON_SCHEDULE || "0 10 * * *";
  const timezone = process.env.CRON_TIMEZONE || "Asia/Kolkata";

  if (!cron.validate(cronSchedule)) {
    console.error(`[CronService] Invalid cron expression "${cronSchedule}". Cron jobs failed to initialize.`);
    return null;
  }

  console.log(`[CronService] Registering Good Morning email cron job ("${cronSchedule}", timezone: "${timezone}")...`);

  const task = cron.schedule(
    cronSchedule,
    async () => {
      console.log(`[CronService] Cron timer triggered daily job ("${cronSchedule}")...`);
      await sendDailyGoodMorningEmails();
    },
    {
      scheduled: true,
      timezone: timezone,
    }
  );

  console.log(`[CronService] Cron jobs initialized successfully.`);
  return task;
}

export default {
  sendDailyGoodMorningEmails,
  initCronJobs,
};
