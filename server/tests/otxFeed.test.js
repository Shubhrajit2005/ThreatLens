import OTXFeed from "../src/feeds/OTXFeed.js";

const runTest = () => {
  console.log("\n--- OTX Feed Test Started ---");

  const feed = new OTXFeed();

  const sampleData = {
    id: "otx-test-001",
    type: "IPv4",
    indicator: "8.8.8.8",
    confidence: 85,
    created: "2026-01-01T00:00:00.000Z",
    modified: "2026-01-02T00:00:00.000Z",
    tags: ["test", "malicious-ip"],
  };

  try {
    const result = feed.normalize(sampleData);

    if (
      result.value === "8.8.8.8" &&
      result.type === "ipv4" &&
      result.source.name === "OTX" &&
      result.source.reference === "otx-test-001" &&
      result.confidence === 85
    ) {
      console.log("PASS: OTX indicator normalized correctly");
    } else {
      console.log("FAIL: OTX normalization result incorrect");
      console.log(result);
    }
  } catch (error) {
    console.log("FAIL:", error.message);
  }

  console.log("\nOTX FEED TEST COMPLETED");
};

runTest();