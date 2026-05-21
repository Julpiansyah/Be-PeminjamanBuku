'use strict';
const { Model, DataTypes, Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Loan extends Model {
    static associate(models) {
      // associations already defined in index.js
    }
  }
  
  Loan.init({
    book_id: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER,
    loan_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    due_date: DataTypes.DATE,
    return_date: DataTypes.DATE,
    status: {
      type: DataTypes.ENUM('dipinjam', 'dikembalikan', 'terlambat'),
      defaultValue: 'dipinjam'
    },
    notes: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Loan',
    tableName: 'loans',
    underscored: true,
    scopes: {
      active: { where: { status: 'dipinjam' } },
      returned: { where: { status: 'dikembalikan' } },
    },
  });

  return Loan;
};