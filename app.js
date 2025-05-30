const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });

const express = require("express");
const cors = require('cors');
const fileUpload = require('express-fileupload');
const path = require("path");
const fs = require("fs");
const Task = require("./models/Task");

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

    const uploadPath = path.join(
      __dirname,
      process.env.UPLOAD_FILE_PATH,
      uploadedFile.name.replace('.csv', '') + Date.now() + '.csv'
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
        fileName: uploadedFile.name.replace(".csv", "") + Date.now() + ".csv",
      });

      res.send({
        message: "File uploaded successfully!",
        fileName: uploadedFile.name,
        path: `/${process.env.UPLOAD_FILE_PATH}/${uploadedFile.name}`,
      });
    });
});

app.get('/', (req, res) => res.send("Hello from server"))

module.exports = app;