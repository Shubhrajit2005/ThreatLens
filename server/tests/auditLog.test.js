import "dotenv/config";
import mongoose from "mongoose";

import env from "../src/config/env.js";
import AuditLog from "../src/models/AuditLog.js";
import createAuditLog from "../src/services/auditLogService.js";

const test = async () => {
  console.log("Testing Audit Log Service...\n");

  await mongoose.connect(env.mongoUri);

  console.log("PASS: MongoDB connected");

  const userId = "6aaff9d7c83296108acb59ef";
  const resourceId = "6ab7fa386fe3e17f03275f40";

  const auditLog = await createAuditLog({
    userId,
    action: "test_action",
    resourceType: "ioc",
    resourceId,
    ipAddress: "127.0.0.1",
    details: {
      test: true,
      message: "Audit log service test",
    },
  });

  if (!auditLog) {
    throw new Error("Audit log was not created");
  }

  console.log("PASS: Audit log created");

  if (auditLog.userId.toString() !== userId) {
    throw new Error("Audit log userId is incorrect");
  }

  console.log("PASS: Audit log userId is correct");

  if (auditLog.action !== "test_action") {
    throw new Error("Audit log action is incorrect");
  }

  console.log("PASS: Audit log action is correct");

  if (auditLog.resourceType !== "ioc") {
    throw new Error(
      "Audit log resourceType is incorrect"
    );
  }

  console.log(
    "PASS: Audit log resourceType is correct"
  );

  if (auditLog.resourceId.toString() !== resourceId) {
    throw new Error(
      "Audit log resourceId is incorrect"
    );
  }

  console.log(
    "PASS: Audit log resourceId is correct"
  );

  if (auditLog.details?.test !== true) {
    throw new Error(
      "Audit log details are incorrect"
    );
  }

  console.log("PASS: Audit log details are correct");

  await AuditLog.findByIdAndDelete(auditLog._id);

  console.log("PASS: Test audit log cleaned up");

  await mongoose.disconnect();

  console.log(
    "\nAudit Log Service test completed successfully."
  );
};

test().catch(async (error) => {
  console.error("\nFAIL:", error.message);

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  process.exit(1);
});