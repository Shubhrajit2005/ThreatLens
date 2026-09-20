import cron from "node-cron";

const startFeedScheduler = () => {
  // Run every hour
  cron.schedule("0 * * * *", async () => {
    console.log("\n--- Feed Scheduler Triggered ---");

    try {
      console.log("Feed synchronization started");

      // Feed ingestion will be connected here later.
      // For now, this confirms the scheduler is working.

      console.log("Feed synchronization completed");
    } catch (error) {
      console.error(
        "Feed synchronization failed:",
        error.message
      );
    }
  });

  console.log("Feed scheduler started");
};

export default startFeedScheduler;