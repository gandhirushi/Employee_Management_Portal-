import express from "express";
import cors from "cors";
import compression from "compression";
import path from "node:path";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

import authRoutes from "./routes/auth.routes.js";
import employeeRoutes from "./routes/employee.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import settingsRoutes from "./routes/settings.routes.js";
import leaveRoutes from "./routes/leave.routes.js";
import cronRoutes from "./routes/cron.routes.js";
import chatRoutes from "./routes/chat.routes.js";

import { errorHandler } from "./middleware/error.middleware.js";
import { notFoundHandler } from "./middleware/notFound.middleware.js";
import { globalRateLimiter } from "./middleware/rateLimiter.middleware.js";
import { cacheMetrics } from "./utils/cacheMetrics.js";
import { cacheService } from "./services/cache.service.js";

const app = express();

// Enable trust proxy for correct client IP detection behind reverse proxies (Nginx, Cloudflare, etc.)
app.set("trust proxy", 1);

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Documentation",
      description: "Learning Swagger",
      version: "1.0.0",
    },
    servers: [
      {
        url: "http://localhost:5000",
      },
    ],
  },
  apis: ["./src/app.js", "./src/routes/auth.routes.js"],
};

const swaggerSpecs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "York Admin Backend is running",
  });
});

// Serve uploads folder statically so images can be loaded in browser
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
  })
);

app.use(compression());
app.use(express.json());

// Global API rate limiter safety net
app.use("/api", globalRateLimiter);

// Cache Monitoring & Metrics API
app.get("/api/cache/metrics", (req, res) => {
  res.json({
    success: true,
    data: cacheMetrics.getSnapshot(),
  });
});

// Cache Flush Endpoint
app.post("/api/cache/flush", (req, res) => {
  cacheService.flushAll();
  cacheMetrics.reset();
  res.json({
    success: true,
    message: "Cache flushed successfully.",
  });
});

// Application Routes
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/cron", cronRoutes);

// Error Handling Middleware
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
export { app };
