'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Return extends Model {
    static associate(models) {
      // associations already defined in index.js
    }
  }
  
  Return.init({
    loan_id: DataTypes.INTEGER,
    return_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    condition: {
      type: DataTypes.ENUM('baik', 'rusak_ringan', 'rusak_berat', 'hilang'),
      defaultValue: 'baik'
    },
    fine_amount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    notes: DataTypes.TEXT,
    processed_by: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Return',
    tableName: 'returns',
    underscored: true,
  });

  return Return;
};