import enrichIP from "../src/services/providers/ipEnrichmentProvider.js";

console.log("--- IP Enrichment Error Test Started ---");

try {
  await enrichIP("");

  console.log("FAIL: Empty IP should have thrown an error");
} catch (error) {
  if (error.message === "IP address is required") {
    console.log("PASS: Missing IP rejected correctly");
  } else {
    console.log("FAIL: Unexpected error:", error.message);
  }
}

console.log("\nIP ENRICHMENT ERROR TEST COMPLETED");