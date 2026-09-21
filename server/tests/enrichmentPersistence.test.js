import mongoose from "mongoose";
import IOC from "../src/models/IOC.js";
import { normalizeIOC } from "../src/services/normalizationService.js";
import enrichIOC from "../src/services/enrichmentService.js";
import connectDatabase from "../src/config/database.js";

const runTest = async () => {
  try {
    console.log("\n--- Enrichment Persistence Test Started ---");

    await connectDatabase();

    const value = "192.0.2.101";
    const type = "ipv4";

    const normalizedValue = normalizeIOC(value, type);

    const enrichment = await enrichIOC({
      value,
      type,
    });

    const ioc = await IOC.create({
      value,
      normalizedValue,
      type,
      confidence: 80,
      tags: ["enrichment-test"],
      enrichment,
    });

    console.log("PASS: IOC created with enrichment");

    const savedIOC = await IOC.findById(ioc._id);

    if (!savedIOC) {
      throw new Error("IOC could not be retrieved from MongoDB");
    }

    console.log("PASS: IOC retrieved from MongoDB");

    if (
      savedIOC.enrichment.country === null &&
      savedIOC.enrichment.asn === null &&
      savedIOC.enrichment.organization === null &&
      savedIOC.enrichment.malwareFamily === null &&
      savedIOC.enrichment.reputation === null
    ) {
      console.log("PASS: Enrichment data persisted correctly");
    } else {
      console.log("FAIL: Enrichment data is incorrect");
    }

    await IOC.findByIdAndDelete(ioc._id);

    console.log("PASS: Test IOC deleted");

    console.log("\nENRICHMENT PERSISTENCE TEST COMPLETED");
  } catch (error) {
    console.error("ENRICHMENT PERSISTENCE TEST FAILED:", error.message);

    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

runTest();
