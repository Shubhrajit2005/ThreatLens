import app from "./app.js";
import env from "./config/env.js";
import connectDatabase from "./config/database.js";
import startFeedScheduler from "./jobs/feedScheduler.js";

const startServer = async () => {
  await connectDatabase();

  startFeedScheduler();

  app.listen(env.port, () => {
    console.log(
      `ThreatLens API running on http://localhost:${env.port}`
    );
  });
};

startServer();