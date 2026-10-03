import nodemailer from "nodemailer";
import { getWelcomeEmailHtml } from "../templates/welcome.template.js";
import { getGoodMorningEmailHtml } from "../templates/goodMorning.template.js";

let transporter = null;

/**
 * Initialize or retrieve the nodemailer transporter singleton.
 */
function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: process.env.SMTP_SECURE === "true" || port === 465,
    auth: {
      user,
      pass,
    },
  });

  return transporter;
}

/**
 * Send the "Welcome to York" email to a newly registered user.
 * Wrapped with fault-tolerant error handling so any email issue
 * does NOT block authentication or create duplicate users.
 * 
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.fullName - Recipient full name
 * @param {string} [options.authProvider="google"] - "google" or "local"
 * @returns {Promise<{ sent: boolean, messageId?: string, error?: string }>}
 */

export async function sendWelcomeEmail({ to, fullName, authProvider = "google" }) {
  try {
    const client = getTransporter();

    if (!client) {
      console.log(`[EmailService] SMTP credentials not fully configured. Skipped sending welcome email to ${to}`);
      return { sent: false, skipped: true };
    }

    const isGoogle = authProvider === "google";
    const fromName = process.env.EMAIL_FROM_NAME || "York HR";
    const fromAddress = process.env.EMAIL_FROM_ADDRESS || process.env.SMTP_USER;

    const info = await client.sendMail({
      from: `"${fromName}" <${fromAddress}>`,
      to,
      subject: "Welcome to York - Your Employee Portal",
      text: `Welcome to York, ${fullName || "Team Member"}!\n\nYour account has been successfully registered${isGoogle ? " with Google" : ""}. You can now access the York Employee Management System at: ${process.env.FRONTEND_URL || "http://localhost:5173"}\n\n- The York HR Team`,
      html: getWelcomeEmailHtml(fullName, authProvider),
    });

    console.log(`[EmailService] "Welcome to York" email sent successfully to ${to} (MessageId: ${info.messageId})`);
    return { sent: true, messageId: info.messageId };
  } catch (err) {
    // Log error cleanly, but never throw so authentication remains unbroken
    console.error(`[EmailService] Failed to send welcome email to ${to}:`, err.message);
    return { sent: false, error: err.message };
  }
}


/**
 * Send the daily "Good Morning" email to an active employee.
 * Wrapped with fault-tolerant error handling so any single email failure
 * does NOT throw an exception or block other emails.
 * 
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.fullName - Recipient full name
 * @returns {Promise<{ sent: boolean, messageId?: string, error?: string, skipped?: boolean, reason?: string }>}
 */
export async function sendGoodMorningEmail({ to, fullName }) {
  try {
    const client = getTransporter();

    if (!client) {
      console.log(`[EmailService] SMTP credentials not fully configured. Skipped Good Morning email to ${to}`);
      return { sent: false, skipped: true, reason: "SMTP credentials not configured" };
    }

    if (!to || typeof to !== "string" || !to.includes("@")) {
      return { sent: false, skipped: true, reason: "Invalid recipient email address" };
    }

    const name = fullName ? fullName.trim() : "Team Member";
    const fromName = process.env.EMAIL_FROM_NAME || "York HR";
    const fromAddress = process.env.EMAIL_FROM_ADDRESS || process.env.SMTP_USER;

    const info = await client.sendMail({
      from: `"${fromName}" <${fromAddress}>`,
      to: to.trim(),
      subject: `Good Morning ${name} - York HR`,
      text: `Good Morning ${name}!\n\nWe wish you a wonderful and productive day ahead.\n\nAccess your portal at: ${process.env.FRONTEND_URL || "http://localhost:5173"}\n\n- The York HR Team`,
      html: getGoodMorningEmailHtml(name),
    });

    console.log(`[EmailService] "Good Morning" email sent successfully to ${to} (MessageId: ${info.messageId})`);
    return { sent: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[EmailService] Failed to send Good Morning email to ${to}:`, err.message);
    return { sent: false, error: err.message };
  }
}

export default {
  sendWelcomeEmail,
  sendGoodMorningEmail,
};

