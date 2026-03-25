export const config = {
  adminUsername: process.env.ADMIN_USERNAME || "admin",
  adminPassword: process.env.ADMIN_PASSWORD || "changeme",
  jwtSecret: process.env.JWT_SECRET || "dev-secret",
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
  port: parseInt(process.env.PORT || "8000"),
};
