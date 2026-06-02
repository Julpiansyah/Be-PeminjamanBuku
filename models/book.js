'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Book extends Model {
    static associate(models) {
      // associations already defined in index.js
    }
  }
  
  Book.init({
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    author: {
      type: DataTypes.STRING,
      allowNull: false
    },
    isbn: {
      type: DataTypes.STRING,
    },
    publisher: {
      type: DataTypes.STRING,
    },
    year: {
      type: DataTypes.INTEGER,
    },
    category: {
      type: DataTypes.STRING,
    },
    description: {
      type: DataTypes.TEXT,
    },
    stock: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: { min: 0 }
    },
    cover_image: {
      type: DataTypes.STRING
    }
  }, {
    sequelize,
    modelName: 'Book',
    tableName: 'books',
    underscored: true
  });

  return Book;
};