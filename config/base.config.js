require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  node_env: process.env.NODE_ENV || 'development',
  
  // Database config untuk Sequelize CLI (sesuaikan dengan format guru)
  development: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME_DEVELOPMENT,  
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT,            
    logging: false,
  },
  
  // JWT config (sesuaikan nama variable)
  auth_secret: process.env.AUTH_SECRET,         
  jwt_expire: process.env.JWT_EXPIRE,
  
  // Upload config
  max_file_size: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024,
  allowed_extensions: (process.env.ALLOWED_EXTENSIONS || 'jpg,jpeg,png').split(','),
};