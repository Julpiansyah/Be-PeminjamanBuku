const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME_DEVELOPMENT,  // ✅ Sesuaikan dengan .env guru
  process.env.DB_USERNAME,           // ✅ DB_USERNAME bukan DB_USER
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT, // ✅ Pakai DB_DIALECT dari .env
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

module.exports = sequelize;