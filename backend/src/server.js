import "dotenv/config";
import http from "node:http";
import { app } from "./app.js";
import { initSocketServer } from "./socket/socket.server.js";
import { initCronJobs } from "./services/cron.service.js";
import { initRedis, closeRedisConnection } from "./config/redis.js";

const PORT = process.env.PORT || 5000;

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