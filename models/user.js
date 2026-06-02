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
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('admin', 'user'),
      defaultValue: 'user',
      allowNull: false
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

  // Hash password sebelum update jika ada perubahan password
  User.beforeUpdate(async (user) => {
    if (user.changed('password')) {
      user.password = passwordHash.generate(user.password);
    }
  });

  return User;
};