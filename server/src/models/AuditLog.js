import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  action: {
    type: String,
    required: true,
    trim: true,
  },

  resourceType: {
    type: String,
    required: true,
    enum: ["user", "ioc", "feed", "investigation", "system"],
  },

  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },

  ipAddress: {
    type: String,
    default: null,
    trim: true,
  },

  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },

  timestamp: {
    type: Date,
    default: Date.now,
  },
});

auditLogSchema.index({ userId: 1 });

auditLogSchema.index({ resourceType: 1, resourceId: 1 });

auditLogSchema.index({ timestamp: -1 });

const AuditLog = mongoose.model("AuditLog", auditLogSchema);

export default AuditLog;
