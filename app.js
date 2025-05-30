const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });

const express = require("express");
const cors = require('cors');
const fileUpload = require('express-fileupload');
const path = require("path");
const fs = require("fs");
const Task = require("./models/Task");
const redisClient = require('./domain/connection/redisConnect');

const app = express();
app.use(cors());

// Middleware to handle file uploads
app.use(fileUpload());

// Serve static files (for testing download or access later if needed)
app.use(express.static(process.env.UPLOAD_FILE_PATH));

app.post('/import', (req, res) => {
    if (!req.files || !req.files.csvfile) {
      return res.status(400).send("No file was uploaded.");
    }

    const uploadedFile = req.files.csvfile;
    const filenameGen =
      uploadedFile.name.replace(".csv", "") + Date.now() + ".csv";

    const uploadPath = path.join(
      __dirname,
      process.env.UPLOAD_FILE_PATH,
      filenameGen
    );

    // Create 'uploads' directory if it doesn't exist
    if (!fs.existsSync(path.join(__dirname, process.env.UPLOAD_FILE_PATH))) {
      fs.mkdirSync(path.join(__dirname, process.env.UPLOAD_FILE_PATH));
    }

    uploadedFile.mv(uploadPath, (err) => {
      if (err) {
        return res.status(500).send(err);
      }

      Task.create({
        fileName: filenameGen,
      });

      res.send({
        message: "File uploaded successfully!",
        fileName: filenameGen,
        path: `/${process.env.UPLOAD_FILE_PATH}/${filenameGen}`,
      });
    });
});

app.get('/user-analysis', async (req, res) => {
  const twenty = await redisClient.get('below20');
  const fourty = await redisClient.get("below40");
  const sixty = await redisClient.get("below60");
  const above = await redisClient.get("above");
  const total = await redisClient.get("total");

  res.status(200).json({
    status: 1,
    response: {
      below20: (twenty / total) * 100,
      below40: (fourty / total) * 100,
      below60: (sixty / total) * 100,
      above: (above / total) * 100
    }
  })
});

app.get('/', (req, res) => res.send("Hello from server"))

module.exports = app;