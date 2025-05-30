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
const User = require("../models/User");

console.log("Start importing");
const maxImportCount = 100;

async function readHeader(filePath) {
    console.log(filePath);
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    console.log("First line:", line);
    return line.split(',');
    break; // exit after first line
  }
  return [];
}

(async () => {
    try {
        await connectPostgres();
        await require("./../domain/connection/redisConnect");

        while(true) {
            const pendingTask = await Task.findOne({
              where: {
                isRunning: false,
              },
              order: [
                ["createdAt", "asc"],
                ["importCount", "desc"],
              ],
            });
            console.log(pendingTask);
            if (pendingTask?.fileName) {
                const filePath = path.join(
                  `${__dirname}/../`,
                  process.env.UPLOAD_FILE_PATH,
                  pendingTask?.fileName
                );
                const headers = await readHeader(filePath);
                console.log(headers);

                const readStream = readline.createInterface({
                    input: fs.createReadStream(filePath),
                    crlfDelay: Infinity
                })
                const csvData = [];
                const skip = pendingTask.csvCursor > 0 ? pendingTask.csvCursor : 1;
                const limit = 100; 

                let lineCount = 0;
                let readCount = 0;

                readStream.on("line", (line) => {
                  if (lineCount < skip) {
                    lineCount++;
                    return;
                  }

                  if (readCount < limit) {
                    console.log(`Line ${lineCount + 1}:`, line);

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
                    obj.name = obj.name.firstName + ' ' + obj.name.lastName;
                    csvData.push(obj);
                    readCount++;
                    lineCount++;
                  } else {
                    console.log("Reading complted");
                    rl.close(); // stop reading early
                  }
                });

                await User.bulkCreate(csvData);
                await Task.update(
                  { importCount: readCount }, // fields to update
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