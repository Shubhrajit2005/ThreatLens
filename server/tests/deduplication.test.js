import mongoose from "mongoose";
import connectDatabase from "../src/config/database.js";
import IOC from "../src/models/IOC.js";

import { 
  deduplicateIOC,
  createIOCIfNotExists,
 } from "../src/services/deduplicationService.js";

const test = async () => {
  try {
    await connectDatabase();

    console.log("\n--- Multi-Source Deduplication Test Started ---");

    const testIOC = {
      value: "Example.COM",
      normalizedValue: "example.com",
      type: "domain",
    };

    await IOC.deleteOne({
      normalizedValue: testIOC.normalizedValue,
      type: testIOC.type,
    });

    // Create IOC from OTX
    const createdIOC = await IOC.create({
      value: testIOC.value,
      normalizedValue: testIOC.normalizedValue,
      type: testIOC.type,
      sources: [
        {
          feedName: "OTX",
          sourceReference: "otx-test-001",
        },
      ],
    });

    console.log("Created IOC with OTX source");

    // Same IOC arrives from URLhaus
    const result = await deduplicateIOC({
      ...testIOC,
      source: {
        feedName: "URLhaus",
        sourceReference: "urlhaus-test-001",
      },
    });

    if (result.isDuplicate === true) {
      console.log("PASS: Duplicate IOC detected");
    } else {
      console.log("FAIL: Duplicate IOC was not detected");
    }

    const updatedIOC = await IOC.findById(createdIOC._id);

    if (updatedIOC.sources.length === 2) {
      console.log("PASS: Second feed source added successfully");
    } else {
      console.log(
        `FAIL: Expected 2 sources, found ${updatedIOC.sources.length}`
      );
    }

    const hasOTX = updatedIOC.sources.some(
      (source) => source.feedName === "OTX"
    );

    const hasURLhaus = updatedIOC.sources.some(
      (source) => source.feedName === "URLhaus"
    );

    if (hasOTX && hasURLhaus) {
      console.log("PASS: Both feed sources preserved");
    } else {
      console.log("FAIL: Feed source information is incomplete");
    }

    // Send the same URLhaus source again
    await deduplicateIOC({
      ...testIOC,
      source: {
        feedName: "URLhaus",
        sourceReference: "urlhaus-test-001",
      },
    });

    const finalIOC = await IOC.findById(createdIOC._id);

    if (finalIOC.sources.length === 2) {
      console.log(
        "PASS: Duplicate source was not added twice"
      );
    } else {
      console.log(
        `FAIL: Expected 2 sources, found ${finalIOC.sources.length}`
      );
    }

    await IOC.deleteOne({
      _id: createdIOC._id,
    });

    const duplicateTestData = {
  value: "192.0.2.50",
  normalizedValue: "192.0.2.50",
  type: "ipv4",
};

await IOC.deleteOne({
  normalizedValue: duplicateTestData.normalizedValue,
  type: duplicateTestData.type,
});

const firstCreate = await createIOCIfNotExists(
  duplicateTestData
);

if (firstCreate.created === true) {
  console.log("PASS: First IOC was created");
} else {
  console.log("FAIL: First IOC was not created");
}

const secondCreate = await createIOCIfNotExists(
  duplicateTestData
);

if (
  secondCreate.created === false &&
  secondCreate.duplicate === true
) {
  console.log(
    "PASS: Second IOC correctly handled as duplicate"
  );
} else {
  console.log(
    "FAIL: Second IOC was not correctly handled"
  );
}

await IOC.deleteOne({
  normalizedValue: duplicateTestData.normalizedValue,
  type: duplicateTestData.type,
});

console.log("Duplicate-key test IOC deleted");

    console.log("Test IOC deleted");

    console.log("\nMULTI-SOURCE DEDUPLICATION TEST COMPLETED");

    await mongoose.connection.close();
  } catch (error) {
    console.error(
      "MULTI-SOURCE DEDUPLICATION TEST FAILED:",
      error.message
    );

    await mongoose.connection.close();
    process.exit(1);
  }
};

test();