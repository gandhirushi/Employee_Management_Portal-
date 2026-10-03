import { sendDailyGoodMorningEmails } from "../services/cron.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Controller to manually trigger the daily Good Morning email cron task.
 * Restricted to Super Admin and HR Admin.
 */
export const triggerGoodMorningEmails = asyncHandler(async (req, res) => {
  const result = await sendDailyGoodMorningEmails();

  res.json({
    success: true,
    message: "Good Morning email job execution completed.",
    data: result,
  });
});
