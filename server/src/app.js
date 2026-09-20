import express from "express";
import cors from "cors";
import helmet from "helmet";
import env from "./config/env.js";
import authRoutes from "./routes/authRoutes.js";
import iocRoutes from "./routes/iocRoutes.js";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: env.clientUrl,
  })
);

app.use(express.json());

app.use("/api/auth", authRoutes);

app.use("/api/iocs", iocRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "ThreatLens API is running",
    environment: env.nodeEnv,
  });
});

export default app;