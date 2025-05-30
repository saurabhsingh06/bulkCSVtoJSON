// models/User.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("./../domain/connection/postgresConnect");

const User = sequelize.define(
  "User",
  {
    name: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
    tableName: "users",
  }
);

module.exports = User;
