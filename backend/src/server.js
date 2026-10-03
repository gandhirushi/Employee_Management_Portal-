import "dotenv/config";
import http from "node:http";
import path from "node:path";
import employeeRoutes from "./routes/employee.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import settingsRoutes from "./routes/settings.routes.js";
import leaveRoutes from "./routes/leave.routes.js";
import cronRoutes from "./routes/cron.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import express from "express";
import cors from "cors";
import compression from "compression";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import { initSocketServer } from "./socket/socket.server.js";
import { initCronJobs } from "./services/cron.service.js";
import { initRedis, closeRedisConnection } from "./config/redis.js";
import { cacheMetrics } from "./utils/cacheMetrics.js";
import { cacheService } from "./services/cache.service.js";


import authRoutes from "./routes/auth.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { notFoundHandler } from "./middleware/notFound.middleware.js";
import { globalRateLimiter } from "./middleware/rateLimiter.middleware.js";

const app = express();

// Enable trust proxy for correct client IP detection behind reverse proxies (Nginx, Cloudflare, etc.)
app.set("trust proxy", 1);
const option = {
  definition: {
    openapi: '3.0.0',

    info: {
      title: 'API Documentation',
      description: 'Learning Swagger',
      version: '1.0.0'
    },

    servers: [
      {
        url: 'http://localhost:5000'
      }
    ]
  },

  apis: ['./src/server.js','./src/routes/auth.routes.js']
};

const spacs = swaggerJsdoc(option)
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(spacs))
/**
 * @swagger
 * /:
 *   get:
 *     summary: Practise
 *     description: Learning Swagger
 *     responses:
 *       200:
 *         description: On success
 */

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "York Admin Backend is running",
  });
});







// Serve uploads folder statically so images can be loaded in browser
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

const PORT = process.env.PORT || 5000;

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

app.use("/api/auth", authRoutes);

app.use("/api/employees", employeeRoutes);

app.use("/api/notifications",notificationRoutes );

app.use("/api/settings",settingsRoutes);

app.use("/api/leaves", leaveRoutes);

app.use("/api/chat", chatRoutes);

app.use("/api/cron", cronRoutes);


app.use(notFoundHandler);

app.use(errorHandler);

const server = http.createServer(app);
initSocketServer(server);

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  initRedis();
  initCronJobs();
});

// Graceful Shutdown Handler
async function handleShutdown(signal) {
  console.log(`\n[Server] Received ${signal}. Gracefully shutting down...`);
  server.close(async () => {
    console.log("[Server] HTTP server closed.");
    await closeRedisConnection();
    process.exit(0);
  });

  // Force shutdown if cleanup takes longer than 10s
  setTimeout(() => {
    console.error("[Server] Forceful shutdown initiated after timeout.");
    process.exit(1);
  }, 10000).unref();
}

process.on("SIGINT", () => handleShutdown("SIGINT"));
process.on("SIGTERM", () => handleShutdown("SIGTERM"));
