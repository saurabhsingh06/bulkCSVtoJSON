const { DataTypes } = require("sequelize");
const { sequelize } = require("./../domain/connection/postgresConnect");

const Task = sequelize.define(
  "Task",
  {
    fileName: {
        type: DataTypes.STRING
    },
    importCount: {
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 0
    },
    isRunning: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: "queue"
    },
    lastRunAt: {
        type: DataTypes.DATE
    },
    csvCursor: {
        type: DataTypes.INTEGER.UNSIGNED
    }
  },
  {
    timestamps: true, // adds createdAt and updatedAt
    tableName: "tasks",
  }
);

module.exports = Task;
