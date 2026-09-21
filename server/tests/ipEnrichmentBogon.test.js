import enrichIP from "../src/services/providers/ipEnrichmentProvider.js";

const runTest = async () => {
  try {
    console.log("\n--- IP Enrichment Bogon Test Started ---");

    const result = await enrichIP("192.0.2.100");

    if (result) {
      console.log("PASS: Bogon IP returned an enrichment result");
    } else {
      console.log("FAIL: No enrichment result returned");
    }

    if (
      result.country === null &&
      result.asn === null &&
      result.organization === null &&
      result.malwareFamily === null &&
      result.reputation === null
    ) {
      console.log("PASS: Bogon IP returned empty enrichment");
    } else {
      console.log("FAIL: Bogon IP enrichment is incorrect");
    }

    console.log("\nIP ENRICHMENT BOGON TEST COMPLETED");
  } catch (error) {
    console.error(
      "IP ENRICHMENT BOGON TEST FAILED:",
      error.message
    );

    process.exitCode = 1;
  }
};

runTest();