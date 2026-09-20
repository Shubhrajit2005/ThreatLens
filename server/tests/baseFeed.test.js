import BaseFeed from "../src/feeds/BaseFeed.js";

const runTest = async () => {
  console.log("\n--- Base Feed Test Started ---");

  const feed = new BaseFeed();

  try {
    await feed.fetch();

    console.log("FAIL: fetch() should throw an error");
  } catch (error) {
    if (error.message === "fetch() not implemented") {
      console.log("PASS: fetch() correctly throws error");
    } else {
      console.log("FAIL: Unexpected fetch() error");
    }
  }

  try {
    feed.normalize({});

    console.log("FAIL: normalize() should throw an error");
  } catch (error) {
    if (error.message === "normalize() not implemented") {
      console.log("PASS: normalize() correctly throws error");
    } else {
      console.log("FAIL: Unexpected normalize() error");
    }
  }

  console.log("\nBASE FEED TEST COMPLETED");
};

runTest();