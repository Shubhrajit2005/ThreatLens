import mongoose from "mongoose";
import IOC from "../src/models/IOC.js";
import { ingestIOCs } from "../src/services/ingestionService.js";
import connectDatabase from "../src/config/database.js";

const runTest = async () => {
  try {
    console.log("\n--- Enrichment Failure Test Started ---");

    await connectDatabase();

    const testIOC = {
      value: "enrichment-failure-test.example",
      type: "domain",
      source: {
        feedName: "TestFeed",
        sourceReference: "enrichment-failure-test",
      },
      confidence: 60,
      tags: ["test"],
    };

    const results = await ingestIOCs([testIOC]);

    if (results.created === 1) {
      console.log(
        "PASS: IOC created despite enrichment failure"
      );
    } else {
      console.log(
        "FAIL: IOC was not created"
      );
    }

    const savedIOC = await IOC.findOne({
      normalizedValue: "enrichment-failure-test.example",
      type: "domain",
    });

    if (savedIOC) {
      console.log(
        "PASS: IOC exists in MongoDB after enrichment failure"
      );
    } else {
      console.log(
        "FAIL: IOC was not found in MongoDB"
      );
    }

    await IOC.deleteOne({
      _id: savedIOC?._id,
    });

    console.log("PASS: Test IOC deleted");

    console.log("\nENRICHMENT FAILURE TEST COMPLETED");
  } catch (error) {
    console.error(
      "ENRICHMENT FAILURE TEST FAILED:",
      error.message
    );

    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

runTest();