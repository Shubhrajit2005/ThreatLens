import cron from "node-cron";

console.log("\n--- Feed Scheduler Test Started ---");

const task = cron.schedule("* * * * *", () => {
  console.log("PASS: Scheduler triggered successfully");

  task.stop();

  console.log("\nFEED SCHEDULER TEST COMPLETED");

  process.exit(0);
});

console.log("Scheduler test started");
console.log("Waiting for scheduler trigger...");