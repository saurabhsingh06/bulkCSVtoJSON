// db/sequelize.js
const { Sequelize } = require("sequelize");

// CREATE USER saurabh_singh WITH PASSWORD 'pass123';
// CREATE DATABASE kelp OWNER saurabh_singh;
const sequelize = new Sequelize("kelp", "saurabh_singh", "pass123", {
  host: "localhost",
  dialect: "postgres",
  logging: false,
});

const connectPostgres = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: true }); 
    console.log("Connected to PostgreSQL via Sequelize ✅");
  } catch (error) {
    console.error("Unable to connect to PostgreSQL ❌", error);
  }
};

module.exports = { sequelize, connectPostgres }; 
