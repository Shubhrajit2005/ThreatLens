import mongoose from "mongoose";

import connectDatabase from "../src/config/database.js";
import IOC from "../src/models/IOC.js";

import { ingestIOCs } from "../src/services/ingestionService.js";

const runTest = async () => {
  try {
    await connectDatabase();

    console.log("\n--- Ingestion Service Test Started ---");

    // Clean previous test data
    await IOC.deleteMany({
      tags: "ingestion-test",
    });

    const testIOCs = [
      {
        value: " INGESTION-Test.Example.COM ",
        type: "domain",
        confidence: 80,
        tags: ["ingestion-test"],
        source: {
          feedName: "OTX",
          sourceReference: "test-001",
          confidence: 80,
          lastSeen: new Date(),
        },
        severity: "high",
      },
      {
        value: "192.0.2.50",
        type: "ipv4",
        confidence: 70,
        tags: ["ingestion-test"],
        source: {
          feedName: "TestFeed",
          sourceReference: "test-002",
          confidence: 70,
        },
      },
      {
        value: "invalid-domain",
        type: "domain",
        confidence: 50,
        tags: ["ingestion-test"],
        source: {
          feedName: "TestFeed",
          sourceReference: "test-003",
          confidence: 50,
        },
      },
    ];

    const result = await ingestIOCs(testIOCs);

    console.log("\nIngestion Results:");
    console.log(result);

    if (result.total === 3) {
      console.log("PASS: Total IOC count correct");
    } else {
      console.log("FAIL: Total IOC count incorrect");
    }

    if (result.created === 2) {
      console.log("PASS: Valid IOCs created");
    } else {
      console.log("FAIL: Valid IOC creation count incorrect");
    }

    if (result.invalid === 1) {
      console.log("PASS: Invalid IOC rejected");
    } else {
      console.log("FAIL: Invalid IOC handling incorrect");
    }

    const domainIOC = await IOC.findOne({
      normalizedValue: "ingestion-test.example.com",
      type: "domain",
    });

    const ipIOC = await IOC.findOne({
      normalizedValue: "192.0.2.50",
      type: "ipv4",
    });

    if (domainIOC && ipIOC) {
      console.log("PASS: Ingested IOCs found in MongoDB");
    } else {
      console.log("FAIL: Ingested IOCs not found in MongoDB");
    }

    if (
      domainIOC?.risk?.score === 69 &&
      domainIOC?.risk?.level === "high" &&
      ipIOC?.risk &&
      typeof ipIOC.risk.score === "number" &&
      typeof ipIOC.risk.level === "string"
    ) {
      console.log("PASS: Severity affects ingestion risk score");
    } else {
      console.log(
        `FAIL: Recency risk score incorrect: ${
          domainIOC?.risk?.score
        } (${domainIOC?.risk?.level})`,
      );
    }

    // Cleanup
    await IOC.deleteMany({
      tags: "ingestion-test",
    });

    console.log("Test IOCs deleted");

    console.log("\nINGESTION SERVICE TEST COMPLETED");

    await mongoose.connection.close();
  } catch (error) {
    console.error("INGESTION SERVICE TEST FAILED:", error.message);

    await mongoose.connection.close();
    process.exit(1);
  }
};

runTest();
