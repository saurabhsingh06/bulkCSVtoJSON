const { connectPostgres, sequelize } = require("./domain/connection/postgresConnect");
const redisClient = require("./domain/connection/redisConnect");
const app = require("./app");
const User = require("./models/User");
const Task = require('./models/Task');

(async () => {
  await connectPostgres(); // Connect to PostgreSQL
})();

app.listen(3000, () => {
  console.log("Server listening at port 3000");
});
