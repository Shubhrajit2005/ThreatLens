import mongoose from "mongoose";

import connectDatabase from "../src/config/database.js";
import IOC from "../src/models/IOC.js";

import { ingestIOCs } from "../src/services/ingestionService.js";

const runTest = async () => {
  try {
    await connectDatabase();

    console.log("\n--- Multi-Source Ingestion Test Started ---");

    const testValue = "multi-source.example.com";

    // Clean previous test data
    await IOC.deleteMany({
      normalizedValue: testValue,
      type: "domain",
    });

    // First feed: OTX
    const otxData = [
      {
        value: testValue,
        type: "domain",
        confidence: 80,
        tags: ["multi-source-test"],
        source: {
          feedName: "OTX",
          sourceReference: "otx-test-001",
          confidence: 80,
        },
      },
    ];

    const firstResult = await ingestIOCs(otxData);

    if (firstResult.created === 1) {
      console.log("PASS: IOC created from OTX");
    } else {
      console.log("FAIL: OTX IOC was not created");
    }

    // Second feed: URLhaus
    const urlhausData = [
      {
        value: testValue,
        type: "domain",
        confidence: 90,
        tags: ["multi-source-test"],
        source: {
          feedName: "URLhaus",
          sourceReference: "urlhaus-test-001",
          confidence: 90,
        },
      },
    ];

    const secondResult = await ingestIOCs(urlhausData);

    if (secondResult.duplicates === 1) {
      console.log("PASS: Duplicate IOC detected");
    } else {
      console.log("FAIL: Duplicate IOC was not detected");
    }

    // Verify MongoDB
    const ioc = await IOC.findOne({
      normalizedValue: testValue,
      type: "domain",
    });

    if (!ioc) {
      throw new Error("IOC not found in MongoDB");
    }

    if (ioc.sources.length === 2) {
      console.log("PASS: Both feed sources preserved");
    } else {
      console.log(
        `FAIL: Expected 2 sources, found ${ioc.sources.length}`
      );
    }

    const otxSource = ioc.sources.some(
      (source) =>
        source.feedName === "OTX" &&
        source.sourceReference === "otx-test-001"
    );

    const urlhausSource = ioc.sources.some(
      (source) =>
        source.feedName === "URLhaus" &&
        source.sourceReference === "urlhaus-test-001"
    );

    if (otxSource && urlhausSource) {
      console.log("PASS: OTX and URLhaus sources verified");
    } else {
      console.log("FAIL: Expected feed sources not found");
    }

    // Cleanup
    await IOC.deleteOne({
      _id: ioc._id,
    });

    console.log("Test IOC deleted");

    console.log("\nMULTI-SOURCE INGESTION TEST COMPLETED");

    await mongoose.connection.close();
  } catch (error) {
    console.error(
      "MULTI-SOURCE INGESTION TEST FAILED:",
      error.message
    );

    await mongoose.connection.close();
    process.exit(1);
  }
};

runTest();