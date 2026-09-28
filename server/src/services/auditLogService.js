import AuditLog from "../models/AuditLog.js";

const createAuditLog = async ({
  userId,
  action,
  resourceType,
  resourceId = null,
  ipAddress = null,
  details = {},
}) => {
  if (!userId) {
    throw new Error("Audit log userId is required");
  }

  if (!action) {
    throw new Error("Audit log action is required");
  }

  if (!resourceType) {
    throw new Error("Audit log resourceType is required");
  }

  return await AuditLog.create({
    userId,
    action,
    resourceType,
    resourceId,
    ipAddress,
    details,
  });
};

export default createAuditLog;