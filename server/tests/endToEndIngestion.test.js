import mongoose from "mongoose";

import connectDatabase from "../src/config/database.js";
import IOC from "../src/models/IOC.js";

import { ingestIOCs } from "../src/services/ingestionService.js";

const runTest = async () => {
  try {
    await connectDatabase();

    console.log("\n--- End-to-End Ingestion Test Started ---");

    const testDomain = "e2e-threatlens.example.com";
    const testIP = "192.0.2.100";

    // Clean previous test data
    await IOC.deleteMany({
      normalizedValue: {
        $in: [testDomain, testIP],
      },
    });

    // Simulated OTX feed
    const otxFeed = [
      {
        value: testDomain,
        type: "domain",
        confidence: 85,
        tags: ["phishing", "e2e-test"],
        source: {
          feedName: "OTX",
          sourceReference: "otx-e2e-001",
          confidence: 85,
        },
      },
      {
        value: testIP,
        type: "ipv4",
        confidence: 75,
        tags: ["suspicious", "e2e-test"],
        source: {
          feedName: "OTX",
          sourceReference: "otx-e2e-002",
          confidence: 75,
        },
      },
    ];

    // Simulated URLhaus feed
    const urlhausFeed = [
      {
        value: testDomain.toUpperCase(),
        type: "domain",
        confidence: 90,
        tags: ["malware", "e2e-test"],
        source: {
          feedName: "URLhaus",
          sourceReference: "urlhaus-e2e-001",
          confidence: 90,
        },
      },
    ];

    // Ingest OTX
    const otxResult = await ingestIOCs(otxFeed);

    console.log("OTX ingestion:", otxResult);

    if (otxResult.created === 2) {
      console.log("PASS: OTX IOCs ingested");
    } else {
      console.log("FAIL: OTX ingestion result incorrect");
    }

    // Ingest URLhaus
    const urlhausResult = await ingestIOCs(urlhausFeed);

    console.log("URLhaus ingestion:", urlhausResult);

    if (urlhausResult.duplicates === 1) {
      console.log("PASS: Cross-feed duplicate detected");
    } else {
      console.log("FAIL: Cross-feed duplicate detection failed");
    }

    // Verify domain
    const domainIOC = await IOC.findOne({
      normalizedValue: testDomain,
      type: "domain",
    });

    if (!domainIOC) {
      throw new Error("Domain IOC not found");
    }

    if (domainIOC.sources.length === 2) {
      console.log("PASS: Domain has two feed sources");
    } else {
      console.log(
        `FAIL: Expected 2 domain sources, found ${domainIOC.sources.length}`
      );
    }

    // Verify IP
    const ipIOC = await IOC.findOne({
      normalizedValue: testIP,
      type: "ipv4",
    });

    if (ipIOC) {
      console.log("PASS: IP IOC stored successfully");
    } else {
      console.log("FAIL: IP IOC not found");
    }

    // Verify total test IOCs
    const testIOCs = await IOC.countDocuments({
      normalizedValue: {
        $in: [testDomain, testIP],
      },
    });

    if (testIOCs === 2) {
      console.log("PASS: Correct number of unique IOCs stored");
    } else {
      console.log(
        `FAIL: Expected 2 unique IOCs, found ${testIOCs}`
      );
    }

    // Cleanup
    await IOC.deleteMany({
      normalizedValue: {
        $in: [testDomain, testIP],
      },
    });

    console.log("Test IOCs deleted");

    console.log("\nEND-TO-END INGESTION TEST COMPLETED");

    await mongoose.connection.close();
  } catch (error) {
    console.error(
      "END-TO-END INGESTION TEST FAILED:",
      error.message
    );

    await mongoose.connection.close();
    process.exit(1);
  }
};

runTest();