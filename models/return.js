'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Return extends Model {
    static associate(models) {
      // associations already defined in index.js
    }
  }
  
  Return.init({
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    loan_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    return_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    notes: {
      type: DataTypes.TEXT
    }
  }, {
    sequelize,
    modelName: 'Return',
    tableName: 'returns',
    underscored: true
  });

  return Return;
};