'use strict';
const { Model, DataTypes, Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Book extends Model {
    static associate(models) {
      // associations already defined in index.js
    }
    
    // Virtual field: cek ketersediaan
    get is_available() {
      return this.stock > 0;
    }
  }
  
  Book.init({
    title: DataTypes.STRING,
    author: DataTypes.STRING,
    publisher: DataTypes.STRING,
    isbn: DataTypes.STRING,
    year: DataTypes.INTEGER,
    category: DataTypes.STRING,
    description: DataTypes.TEXT,
    stock: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: { min: 0 }
    },
    cover_image: DataTypes.STRING,
    status: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.stock > 0 ? 'available' : 'unavailable';
      }
    }
  }, {
    sequelize,
    modelName: 'Book',
    tableName: 'books',
    underscored: true,
    scopes: {
      available: { where: { stock: { [Op.gt]: 0 } } },
      unavailable: { where: { stock: { [Op.lte]: 0 } } },
    },
  });

  return Book;
};