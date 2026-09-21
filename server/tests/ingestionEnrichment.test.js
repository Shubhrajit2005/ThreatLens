import mongoose from "mongoose";
import IOC from "../src/models/IOC.js";
import { ingestIOCs } from "../src/services/ingestionService.js";
import connectDatabase from "../src/config/database.js";

const runTest = async () => {
  try {
    console.log("\n--- Ingestion Enrichment Test Started ---");

    await connectDatabase();

    const testIOCs = [
      {
        value: "192.0.2.102",
        type: "ipv4",
        source: {
          feedName: "OTX",
          sourceReference: "enrichment-test-001",
        },
        confidence: 80,
        tags: ["test"],
      },
      {
        value: "example-enrichment.com",
        type: "domain",
        source: {
          feedName: "URLhaus",
          sourceReference: "enrichment-test-002",
        },
        confidence: 70,
        tags: ["test"],
      },
    ];

    const results = await ingestIOCs(testIOCs);

    if (results.created === 2) {
      console.log("PASS: IOCs ingested successfully");
    } else {
      console.log("FAIL: Expected 2 IOCs to be created");
    }

    const ipIOC = await IOC.findOne({
      normalizedValue: "192.0.2.102",
      type: "ipv4",
    });

    if (
      ipIOC &&
      ipIOC.enrichment &&
      ipIOC.enrichment.country === null &&
      ipIOC.enrichment.asn === null &&
      ipIOC.enrichment.organization === null &&
      ipIOC.enrichment.malwareFamily === null &&
      ipIOC.enrichment.reputation === null
    ) {
      console.log("PASS: IP enrichment stored during ingestion");
    } else {
      console.log("FAIL: IP enrichment was not stored correctly");
    }

    const domainIOC = await IOC.findOne({
      normalizedValue: "example-enrichment.com",
      type: "domain",
    });

    if (
      domainIOC &&
      domainIOC.enrichment &&
      domainIOC.enrichment.organization === "Example Organization" &&
      domainIOC.enrichment.reputation === 50
    ) {
      console.log("PASS: Domain enrichment stored during ingestion");
    } else {
      console.log("FAIL: Domain enrichment was not stored correctly");
    }

    await IOC.deleteMany({
      normalizedValue: {
        $in: ["192.0.2.102", "example-enrichment.com"],
      },
    });

    console.log("PASS: Test IOCs deleted");

    console.log("\nINGESTION ENRICHMENT TEST COMPLETED");
  } catch (error) {
    console.error("INGESTION ENRICHMENT TEST FAILED:", error.message);

    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

runTest();
