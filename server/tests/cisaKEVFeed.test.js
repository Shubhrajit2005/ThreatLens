import CISAKEVFeed from "../src/feeds/CISAKEVFeed.js";

const runTest = () => {
  console.log("\n--- CISA KEV Feed Test Started ---");

  const feed = new CISAKEVFeed();

  const sampleData = {
    cveID: "CVE-2024-12345",
    vendorProject: "Example Vendor",
    product: "Example Product",
    dateAdded: "2026-01-01",
    dueDate: "2026-02-01",
  };

  try {
    const result = feed.normalize(sampleData);

    if (
      result.value === "CVE-2024-12345" &&
      result.type === "cve" &&
      result.source.name === "CISA KEV" &&
      result.source.reference === "CVE-2024-12345" &&
      result.confidence === 100
    ) {
      console.log("PASS: CISA KEV vulnerability normalized correctly");
    } else {
      console.log("FAIL: CISA KEV normalization result incorrect");
      console.log(result);
    }
  } catch (error) {
    console.log("FAIL:", error.message);
  }

  console.log("\nCISA KEV FEED TEST COMPLETED");
};

runTest();