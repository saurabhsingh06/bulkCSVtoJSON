const path = require("path");
const Task = require("../models/Task");
const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });

const {
  connectPostgres,
  sequelize,
} = require("./../domain/connection/postgresConnect");
const fs = require("fs");
const readline = require("readline");
const { Op } = require('sequelize');
const User = require("../models/User");

console.log("Start importing");
const redisClient = require("./../domain/connection/redisConnect");
const maxImportCount = 100;

async function readHeader(filePath) {
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    return line.split(',');
    break; // exit after first line
  }
  return [];
} 

async function readCsvWithLimit(filePath, skip = 0, limit = Infinity, headers) {
  const stream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: stream,
    crlfDelay: Infinity,
  });

  const result = [];
  let lineCount = 0;
  const userAnalysis = {
    "20": 0,
    "40": 0,
    "60": 0,
    "above": 0
  }

  for await (const line of rl) {
    if (lineCount < skip) {
      lineCount++;
      continue;
    }

    if (result.length < limit) {
      const values = line.split(",").map((v) => v.trim());
      const obj = {};
      headers.forEach((header, i) => {
        const value = values[i];
        const keys = header.trim().split(".");
        let current = obj;

        keys.forEach((key, j) => {
          if (j === keys.length - 1) {
            current[key] = value;
          } else {
            current[key] = current[key] || {};
            current = current[key];
          }
        });
      });
      obj.name = obj.name.firstName + " " + obj.name.lastName;
      if (obj.age < 20) userAnalysis["20"]++;
      else if (obj.age < 40) userAnalysis["40"]++;
      else if (obj.age < 60) userAnalysis["60"]++;
      else userAnalysis["above"]++;

      result.push(obj);
    } else {
      rl.close(); // Stop reading early
      stream.destroy(); // Destroy file stream to free up resources
      break;
    }

    lineCount++;
  }

  // Updating redis cache
  await redisClient.incrBy('below20', userAnalysis["20"]);
  await redisClient.incrBy("below40", userAnalysis["40"]);
  await redisClient.incrBy("below60", userAnalysis["60"]);
  await redisClient.incrBy("above", userAnalysis["above"]);
  await redisClient.incrBy("total", result.length);

  return { result };
}

(async () => {
    try {
        await connectPostgres();

        while(true) {
            const pendingTask = await Task.findOne({
              where: {
                isRunning: false,
                status: { [Op.ne]: 'completed' }
              },
              order: [
                ["createdAt", "asc"],
                ["importCount", "desc"],
              ],
            });
            if (pendingTask?.fileName) {
                await Task.update({ isRunning: true, lastRunAt: new Date(), status: "inprogress" }, { where: { fileName: pendingTask?.fileName } });

                const filePath = path.join(
                  `${__dirname}/../`,
                  process.env.UPLOAD_FILE_PATH,
                  pendingTask?.fileName
                );
                const headers = await readHeader(filePath);
                
                const skip = pendingTask.csvCursor ? (pendingTask.csvCursor > 0 ? pendingTask.csvCursor : 1) : 1;
                const limit = 100; 
                const { result } = await readCsvWithLimit(filePath, skip, limit, headers);

                // console.log("csv data", result)
                await User.bulkCreate(result);
                console.log(pendingTask?.fileName)
                await Task.update(
                  {
                    importCount: pendingTask.importCount + result.length,
                    isRunning: false,
                    csvCursor: pendingTask.importCount + result.length + 1,
                    status: result.length < 100 ? "completed" : "inprogress"
                  }, // fields to update
                  { where: { fileName: pendingTask?.fileName } }
                );
            }

            // process.exit();
            await new Promise(res => setTimeout(res, 2000));
        }
        
    } catch (error) {
        console.log(error);
        process.exit();
    }
})();