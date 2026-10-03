import {
  getSettings,
  updateSettings,
} from "../services/settings.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";


// ============================================================
// GET SETTINGS
// ============================================================

export const getUserSettings = asyncHandler(async (req, res) => {
  const settings = await getSettings(req.user.id);

  res.json({
    success: true,
    settings,
  });
});


// ============================================================
// UPDATE SETTINGS
// ============================================================

export const patchUserSettings = asyncHandler(async (req, res) => {
  const settings = await updateSettings(
    req.user.id,
    req.body
  );

  res.json({
    success: true,
    settings,
  });
});