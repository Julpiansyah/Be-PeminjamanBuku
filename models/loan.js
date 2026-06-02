'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Loan extends Model {
    static associate(models) {
      // associations already defined in index.js
    }
  }
  
  Loan.init({
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    book_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    loan_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    return_date: {
      type: DataTypes.DATE
    },
    status: {
      type: DataTypes.ENUM('dipinjam', 'dikembalikan'),
      defaultValue: 'dipinjam'
    }
  }, {
    sequelize,
    modelName: 'Loan',
    tableName: 'loans',
    underscored: true
  });

  return Loan;
};