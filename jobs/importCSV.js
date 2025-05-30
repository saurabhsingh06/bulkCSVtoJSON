const Task = require("../models/Task");
const {
  connectPostgres,
  sequelize,
} = require("./../domain/connection/postgresConnect");

console.log("Start importing");
const maxImportCount = 100;

(async () => {
    try {
        await connectPostgres();
        await require("./../domain/connection/redisConnect");

        const pendingTasks = await Task.findAll({
           where: {
            isRunning: false,
           },
           order: [['createdAt', 'asc'], ['importCount', 'desc']]
        });

        console.log(pendingTasks[0]);
    } catch (error) {
        console.log(err);
    }
})();