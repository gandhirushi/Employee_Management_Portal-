import {
  getNotifications,
  createNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearNotifications,
} from "../services/notification.service.js";

export async function listNotifications(
  req,
  res,
  next
) {
  try {
    const notifications =
      await getNotifications(req.user.id);

    res.json({
      success: true,
      notifications,
    });
  } catch (error) {
    next(error);
  }
}

export async function postNotification(
  req,
  res,
  next
) {
  try {
    const notification =
      await createNotification(
        req.user.id,
        req.body
      );

    res.status(201).json({
      success: true,
      notification,
    });
  } catch (error) {
    next(error);
  }
}

export async function readNotification(
  req,
  res,
  next
) {
  try {
    const notification =
      await markNotificationAsRead(
        req.user.id,
        req.params.id
      );

    res.json({
      success: true,
      notification,
    });
  } catch (error) {
    next(error);
  }
}

export async function readAllNotifications(
  req,
  res,
  next
) {
  try {
    await markAllNotificationsAsRead(
      req.user.id
    );

    res.json({
      success: true,
      message:
        "All notifications marked as read.",
    });
  } catch (error) {
    next(error);
  }
}

export async function removeNotification(
  req,
  res,
  next
) {
  try {
    await deleteNotification(
      req.user.id,
      req.params.id
    );

    res.json({
      success: true,
      message: "Notification deleted.",
    });
  } catch (error) {
    next(error);
  }
}

export async function removeAllNotifications(
  req,
  res,
  next
) {
  try {
    await clearNotifications(
      req.user.id
    );

    res.json({
      success: true,
      message:
        "All notifications deleted.",
    });
  } catch (error) {
    next(error);
  }
}