const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("dicomDB", "root", "Test123!", {
  host: "localhost",
  dialect: "mysql",
  logging: false, // Disable logging
});

module.exports = sequelize;
