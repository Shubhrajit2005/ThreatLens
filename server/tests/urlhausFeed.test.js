import URLhausFeed from "../src/feeds/URLhausFeed.js";

const runTest = () => {
  console.log("\n--- URLhaus Feed Test Started ---");

  const feed = new URLhausFeed();

  const sampleData = {
    id: "urlhaus-test-001",
    url: "https://example.com/malware",
    urlhaus_link: "https://urlhaus.abuse.ch/url/urlhaus-test-001/",
    threat_score: 90,
    dateadded: "2026-01-01 12:00:00",
    last_online: "2026-01-02 12:00:00",
    tags: ["malware", "test"],
  };

  try {
    const result = feed.normalize(sampleData);

    if (
      result.value === "https://example.com/malware" &&
      result.type === "url" &&
      result.source.name === "URLhaus" &&
      result.source.reference === "urlhaus-test-001" &&
      result.confidence === 90
    ) {
      console.log("PASS: URLhaus indicator normalized correctly");
    } else {
      console.log("FAIL: URLhaus normalization result incorrect");
      console.log(result);
    }
  } catch (error) {
    console.log("FAIL:", error.message);
  }

  console.log("\nURLHAUS FEED TEST COMPLETED");
};

runTest();