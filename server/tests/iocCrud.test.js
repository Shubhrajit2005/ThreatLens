import mongoose from "mongoose";
import connectDatabase from "../src/config/database.js";
import IOC from "../src/models/IOC.js";
import {
  createIOC,
  getAllIOCs,
  getIOCById,
  updateIOC,
  deleteIOC,
} from "../src/controllers/iocController.js";
import AuditLog from "../src/models/AuditLog.js";

const createMockResponse = () => {
  return {
    statusCode: null,
    body: null,

    status(code) {
      this.statusCode = code;
      return this;
    },

    json(data) {
      this.body = data;
      return this;
    },
  };
};

const runTest = async () => {
  let createdIOCId;

  // Mock authenticated analyst user
  const testUserId = new mongoose.Types.ObjectId();

  try {
    await connectDatabase();

    console.log("\n--- IOC CRUD Test Started ---");

    // Cleanup previous test IOC
    await IOC.deleteMany({
      normalizedValue: "crud-test.example.com",
      type: "domain",
    });

    // Cleanup previous audit logs for this test user
    await AuditLog.deleteMany({
      userId: testUserId,
    });

    // =========================================================
    // CREATE
    // =========================================================

    const createReq = {
      user: {
        userId: testUserId,
      },
      body: {
        value: " CRUD-TEST.Example.COM ",
        type: "domain",
        confidence: 80,
        tags: ["test", "crud"],
      },
      ip: "127.0.0.1",
    };

    const createRes = createMockResponse();

    await createIOC(createReq, createRes, (error) => {
      throw error;
    });

    if (createRes.statusCode === 201) {
      console.log("PASS: IOC created successfully");
    } else {
      console.log(`FAIL: IOC creation returned ${createRes.statusCode}`);
    }

    createdIOCId = createRes.body.data._id;

    const createdIOC = createRes.body.data;

    if (
      createdIOC.risk &&
      typeof createdIOC.risk.score === "number" &&
      createdIOC.risk.score === 24 &&
      createdIOC.risk.level === "low"
    ) {
      console.log("PASS: IOC risk score calculated correctly");
    } else {
      console.log(
        `FAIL: IOC risk score incorrect: ${
          createdIOC.risk?.score
        } (${createdIOC.risk?.level})`,
      );
    }

    // =========================================================
    // CREATE AUDIT LOG TEST
    // =========================================================

    const createAudit = await AuditLog.findOne({
      userId: testUserId,
      action: "ioc_created",
      resourceType: "ioc",
      resourceId: createdIOCId,
    });

    if (createAudit) {
      console.log("PASS: IOC creation audit log created");
    } else {
      console.log("FAIL: IOC creation audit log not found");
    }

    if (
      createAudit &&
      createAudit.userId.toString() === testUserId.toString()
    ) {
      console.log("PASS: IOC creation audit user is correct");
    } else {
      console.log("FAIL: IOC creation audit user is incorrect");
    }

    if (
      createAudit &&
      createAudit.details.type === createdIOC.type &&
      createAudit.details.value === createdIOC.value
    ) {
      console.log("PASS: IOC creation audit details are correct");
    } else {
      console.log("FAIL: IOC creation audit details are incorrect");
    }

    // =========================================================
    // READ ALL
    // =========================================================

    const getAllReq = {};
    const getAllRes = createMockResponse();

    await getAllIOCs(getAllReq, getAllRes, (error) => {
      throw error;
    });

    if (getAllRes.statusCode === 200 && getAllRes.body.count >= 1) {
      console.log("PASS: IOC list retrieved successfully");
    } else {
      console.log("FAIL: IOC list retrieval failed");
    }

    // =========================================================
    // READ BY ID
    // =========================================================

    const getOneReq = {
      params: {
        id: createdIOCId,
      },
    };

    const getOneRes = createMockResponse();

    await getIOCById(getOneReq, getOneRes, (error) => {
      throw error;
    });

    if (
      getOneRes.statusCode === 200 &&
      getOneRes.body.data._id.toString() === createdIOCId.toString()
    ) {
      console.log("PASS: IOC retrieved by ID");
    } else {
      console.log("FAIL: IOC retrieval by ID failed");
    }

    // =========================================================
    // UPDATE
    // =========================================================

    const updateReq = {
      user: {
        userId: testUserId,
      },
      params: {
        id: createdIOCId,
      },
      body: {
        confidence: 95,
        tags: ["test", "updated"],
        status: "reviewed",
      },
      ip: "127.0.0.1",
    };

    const updateRes = createMockResponse();

    await updateIOC(updateReq, updateRes, (error) => {
      throw error;
    });

    const updatedIOC = updateRes.body.data;

    if (
      updatedIOC.risk &&
      updatedIOC.risk.score === 29 &&
      updatedIOC.risk.level === "low"
    ) {
      console.log("PASS: IOC risk recalculated correctly");
    } else {
      console.log(
        `FAIL: IOC risk recalculation incorrect: ${
          updatedIOC.risk?.score
        } (${updatedIOC.risk?.level})`,
      );
    }

    if (updatedIOC.confidence === 95 && updatedIOC.status === "reviewed") {
      console.log("PASS: IOC fields updated correctly");
    } else {
      console.log("FAIL: IOC fields were not updated correctly");
    }

    // =========================================================
    // UPDATE AUDIT LOG TEST
    // =========================================================

    const updateAudit = await AuditLog.findOne({
      userId: testUserId,
      action: "ioc_updated",
      resourceType: "ioc",
      resourceId: createdIOCId,
    });

    if (updateAudit) {
      console.log("PASS: IOC update audit log created");
    } else {
      console.log("FAIL: IOC update audit log not found");
    }

    if (
      updateAudit &&
      updateAudit.userId.toString() === testUserId.toString()
    ) {
      console.log("PASS: IOC update audit user is correct");
    } else {
      console.log("FAIL: IOC update audit user is incorrect");
    }

    if (
      updateAudit &&
      updateAudit.details.type === "domain" &&
      updateAudit.details.value === "CRUD-TEST.Example.COM" &&
      updateAudit.details.confidence === 95 &&
      updateAudit.details.status === "reviewed"
    ) {
      console.log("PASS: IOC update audit details are correct");
    } else {
      console.log("FAIL: IOC update audit details are incorrect");
    }

    // =========================================================
    // DELETE
    // =========================================================

    const deleteReq = {
      user: {
        userId: testUserId,
      },
      params: {
        id: createdIOCId,
      },
      ip: "127.0.0.1",
    };

    const deleteRes = createMockResponse();

    await deleteIOC(deleteReq, deleteRes, (error) => {
      throw error;
    });

    if (deleteRes.statusCode === 200) {
      console.log("PASS: IOC deleted successfully");
    } else {
      console.log("FAIL: IOC deletion failed");
    }

    // =========================================================
    // DELETE AUDIT LOG TEST
    // =========================================================

    const deleteAudit = await AuditLog.findOne({
      userId: testUserId,
      action: "ioc_deleted",
      resourceType: "ioc",
      resourceId: createdIOCId,
    });

    if (deleteAudit) {
      console.log("PASS: IOC deletion audit log created");
    } else {
      console.log("FAIL: IOC deletion audit log not found");
    }

    if (
      deleteAudit &&
      deleteAudit.userId.toString() === testUserId.toString()
    ) {
      console.log("PASS: IOC deletion audit user is correct");
    } else {
      console.log("FAIL: IOC deletion audit user is incorrect");
    }

    if (
      deleteAudit &&
      deleteAudit.details.type === "domain" &&
      deleteAudit.details.value === "CRUD-TEST.Example.COM"
    ) {
      console.log("PASS: IOC deletion audit details are correct");
    } else {
      console.log("FAIL: IOC deletion audit details are incorrect");
    }

    // =========================================================
    // VERIFY DELETION
    // =========================================================

    const deletedIOC = await IOC.findById(createdIOCId);

    if (!deletedIOC) {
      console.log("PASS: IOC deletion verified");
    } else {
      console.log("FAIL: IOC still exists after deletion");
    }

    // =========================================================
    // CLEANUP
    // =========================================================

    await AuditLog.deleteMany({
      userId: testUserId,
    });

    console.log("PASS: IOC audit test data cleaned up");

    console.log("\nIOC CRUD TEST COMPLETED");

    await mongoose.connection.close();
  } catch (error) {
    console.error("IOC CRUD TEST FAILED:", error.message);

    if (createdIOCId) {
      await IOC.findByIdAndDelete(createdIOCId);
    }

    await AuditLog.deleteMany({
      userId: testUserId,
    });

    await mongoose.connection.close();
    process.exit(1);
  }
};

runTest();
