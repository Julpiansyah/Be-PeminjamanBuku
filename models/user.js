'use strict';
const { Model, DataTypes } = require('sequelize');
const passwordHash = require('password-hash');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // associations already defined in index.js
    }
    
    // Method verifikasi password
    verifyPassword(password) {
      return passwordHash.verify(password, this.password);
    }
  }
  
  User.init({
    name: DataTypes.STRING,
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    role: {
      type: DataTypes.ENUM('admin', 'peminjam'),
      defaultValue: 'peminjam'
    },
    email: DataTypes.STRING,
    phone: DataTypes.STRING,
    address: DataTypes.TEXT,
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    underscored: true,
  });

  // Hash password sebelum save
  User.beforeCreate(async (user) => {
    if (user.password) {
      user.password = passwordHash.generate(user.password);
    }
  });

  return User;
};