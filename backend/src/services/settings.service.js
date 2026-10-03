import prisma from "../prisma/client.js";
import { cacheService } from "./cache.service.js";
import { cacheKeys, CACHE_TTL } from "../utils/cacheKeys.js";

// ============================================================
// GET USER SETTINGS
// ============================================================

export async function getSettings(userId) {
  const cacheKey = cacheKeys.userSettings(userId);

  return cacheService.getOrSet(
    cacheKey,
    async () => {
      let settings = await prisma.userSettings.findUnique({
        where: {
          userId,
        },
      });

      // Create default settings if they don't exist
      if (!settings) {
        settings = await prisma.userSettings.create({
          data: {
            userId,
            notifyEmployee: true,
            notifySystem: true,
            notifyLogin: true,
          },
        });
      }

      return settings;
    },
    CACHE_TTL.USER_SETTINGS
  );
}

// ============================================================
// UPDATE USER SETTINGS
// ============================================================

export async function updateSettings(userId, data) {
  const allowedFields = [
    "notifyEmployee",
    "notifySystem",
    "notifyLogin",
  ];

  const updateData = {};

  for (const field of allowedFields) {
    if (typeof data[field] === "boolean") {
      updateData[field] = data[field];
    }
  }

  const updatedSettings = await prisma.userSettings.upsert({
    where: {
      userId,
    },
    create: {
      userId,
      notifyEmployee: updateData.notifyEmployee ?? true,
      notifySystem: updateData.notifySystem ?? true,
      notifyLogin: updateData.notifyLogin ?? true,
    },
    update: updateData,
  });

  // Invalidate cached user settings immediately
  await cacheService.del(cacheKeys.userSettings(userId));

  return updatedSettings;
}