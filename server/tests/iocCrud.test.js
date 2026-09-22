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

  try {
    await connectDatabase();

    console.log("\n--- IOC CRUD Test Started ---");

    // Cleanup previous test IOC
    await IOC.deleteMany({
      normalizedValue: "crud-test.example.com",
      type: "domain",
    });

    // CREATE
    const createReq = {
      body: {
        value: " CRUD-TEST.Example.COM ",
        type: "domain",
        confidence: 80,
        tags: ["test", "crud"],
      },
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

    // READ ALL
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

    // READ BY ID
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

    // UPDATE
    const updateReq = {
      params: {
        id: createdIOCId,
      },
      body: {
        confidence: 95,
        tags: ["test", "updated"],
        status: "reviewed",
      },
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

    // DELETE
    const deleteReq = {
      params: {
        id: createdIOCId,
      },
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

    // Verify deletion
    const deletedIOC = await IOC.findById(createdIOCId);

    if (!deletedIOC) {
      console.log("PASS: IOC deletion verified");
    } else {
      console.log("FAIL: IOC still exists after deletion");
    }

    console.log("\nIOC CRUD TEST COMPLETED");

    await mongoose.connection.close();
  } catch (error) {
    console.error("IOC CRUD TEST FAILED:", error.message);

    if (createdIOCId) {
      await IOC.findByIdAndDelete(createdIOCId);
    }

    await mongoose.connection.close();
    process.exit(1);
  }
};

runTest();
