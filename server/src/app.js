import express from "express";
import cors from "cors";
import helmet from "helmet";
import env from "./config/env.js";
import authRoutes from "./routes/authRoutes.js";
import iocRoutes from "./routes/iocRoutes.js";
import { apiRateLimiter } from "./middleware/rateLimiter.js";
import errorHandler from "./middleware/errorHandler.js";
import feedRoutes from "./routes/feedRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import investigationRoutes from "./routes/investigationRoutes.js";
import auditLogRoutes from "./routes/auditLogRoutes.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: env.clientUrl,
  })
);

app.use(express.json());

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

app.use("/api/auth", authRoutes);
app.use("/api/iocs", apiRateLimiter, iocRoutes);
app.use("/api/feeds", feedRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/investigations", investigationRoutes);
app.use("/api/audit-logs", auditLogRoutes);
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "ThreatLens API is running",
    environment: env.nodeEnv,
  });
});

app.use(errorHandler);

export default app;