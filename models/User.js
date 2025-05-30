// models/User.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("./../domain/connection/postgresConnect");

const User = sequelize.define(
  "User",
  {
    name: {
      type: DataTypes.STRING,
    },
    age: {
      type: DataTypes.INTEGER,
    },
    address: {
      type: DataTypes.JSONB,
    },
    gender: {
      type: DataTypes.STRING,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
    tableName: "users",
  }
);

module.exports = User;
