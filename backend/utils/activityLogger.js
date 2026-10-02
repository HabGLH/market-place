import ActivityLog from "../models/ActivityLog.js";

export const logActivity = async ({ userId, action, details, entityType = "System", entityId = null, req = null }) => {
  try {
    const ipAddress = req ? (req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "") : "";
    await ActivityLog.create({
      userId,
      action,
      details,
      entityType,
      entityId: entityId ? entityId.toString() : null,
      ipAddress,
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
};
