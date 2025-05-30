// db/redis.js
const { createClient } = require("redis");

const redisClient = createClient();

redisClient.on("error", (err) =>
  console.error("Redis connection error ❌", err)
);
redisClient.on("connect", () => console.log("Connected to Redis ✅"));

redisClient.connect();

module.exports = redisClient;
