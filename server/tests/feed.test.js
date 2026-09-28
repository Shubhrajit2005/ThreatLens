import "dotenv/config";

const BASE_URL = "http://localhost:5000";

const test = async () => {
  console.log("Testing Feed API...\n");

  // Login
  const loginResponse = await fetch(
    `${BASE_URL}/api/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        identifier: "iocanalyst",
        password: "ThreatLens@123",
      }),
    }
  );

  const loginData = await loginResponse.json();

  if (!loginResponse.ok || !loginData.success) {
    throw new Error("Login failed");
  }

  const token = loginData.token;

  console.log("PASS: Analyst login successful");

  // Get feeds
  const feedResponse = await fetch(
    `${BASE_URL}/api/feeds`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const feedData = await feedResponse.json();

  if (!feedResponse.ok || !feedData.success) {
    throw new Error("Feed API request failed");
  }

  console.log("PASS: Feed API returned successfully");

  // Verify count
  if (feedData.count !== 4) {
    throw new Error(
      `Expected 4 feeds, received ${feedData.count}`
    );
  }

  console.log("PASS: Four feeds returned");

  // Verify feed array
  if (!Array.isArray(feedData.feeds)) {
    throw new Error("Feeds is not an array");
  }

  // Required metadata
  const requiredFields = [
    "name",
    "reliability",
    "enabled",
    "type",
    "description",
    "supportedIOCtypes",
  ];

  for (const feed of feedData.feeds) {
    for (const field of requiredFields) {
      if (!(field in feed)) {
        throw new Error(
          `Feed field missing: ${field}`
        );
      }
    }
  }

  console.log(
    "PASS: All feeds contain required metadata"
  );

  // Verify expected feeds
  const feedNames = feedData.feeds.map(
    (feed) => feed.name
  );

  const expectedFeeds = [
    "OTX",
    "URLhaus",
    "MalwareBazaar",
    "CISA KEV",
  ];

  for (const expectedFeed of expectedFeeds) {
    if (!feedNames.includes(expectedFeed)) {
      throw new Error(
        `Expected feed missing: ${expectedFeed}`
      );
    }
  }

  console.log("PASS: Expected feeds are present");

  // Verify reliability values
  for (const feed of feedData.feeds) {
    if (
      typeof feed.reliability !== "number" ||
      feed.reliability < 0 ||
      feed.reliability > 100
    ) {
      throw new Error(
        `Invalid reliability for ${feed.name}`
      );
    }
  }

  console.log(
    "PASS: Feed reliability values are valid"
  );

  // Verify authentication
  const unauthenticatedResponse = await fetch(
    `${BASE_URL}/api/feeds`
  );

  if (unauthenticatedResponse.status !== 401) {
    throw new Error(
      `Expected 401 without authentication, received ${unauthenticatedResponse.status}`
    );
  }

  console.log(
    "PASS: Unauthenticated request rejected with 401"
  );

  console.log("\nFeed API test completed successfully.");
};

test().catch((error) => {
  console.error("\nFAIL:", error.message);
  process.exit(1);
});