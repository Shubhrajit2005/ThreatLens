import mongoose from "mongoose";

import connectDatabase from "../src/config/database.js";
import IOC from "../src/models/IOC.js";

import { ingestIOCs } from "../src/services/ingestionService.js";

const runTest = async () => {
  try {
    await connectDatabase();

    console.log("\n--- Duplicate Source Test Started ---");

    const testValue = "duplicate-source.example.com";

    await IOC.deleteMany({
      normalizedValue: testValue,
      type: "domain",
    });

    const testIOC = {
      value: testValue,
      type: "domain",
      confidence: 85,
      tags: ["duplicate-source-test"],
      source: {
        feedName: "OTX",
        sourceReference: "otx-duplicate-001",
        confidence: 85,
      },
    };

    // First ingestion
    const firstResult = await ingestIOCs([testIOC]);

    if (firstResult.created === 1) {
      console.log("PASS: First ingestion created IOC");
    } else {
      console.log("FAIL: First ingestion did not create IOC");
    }

    // Same source ingested again
    const secondResult = await ingestIOCs([testIOC]);

    if (secondResult.duplicates === 1) {
      console.log("PASS: Second ingestion detected duplicate");
    } else {
      console.log("FAIL: Second ingestion was not detected as duplicate");
    }

    const ioc = await IOC.findOne({
      normalizedValue: testValue,
      type: "domain",
    });

    if (!ioc) {
      throw new Error("Test IOC not found");
    }

    if (ioc.sources.length === 1) {
      console.log("PASS: Duplicate source was not added");
    } else {
      console.log(
        `FAIL: Expected 1 source, found ${ioc.sources.length}`
      );
    }

    // Cleanup
    await IOC.deleteOne({
      _id: ioc._id,
    });

    console.log("Test IOC deleted");

    console.log("\nDUPLICATE SOURCE TEST COMPLETED");

    await mongoose.connection.close();
  } catch (error) {
    console.error(
      "DUPLICATE SOURCE TEST FAILED:",
      error.message
    );

    await mongoose.connection.close();
    process.exit(1);
  }
};

runTest();