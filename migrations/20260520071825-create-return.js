'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('returns', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      loan_id: { 
        type: Sequelize.INTEGER, 
        allowNull: false,
        unique: true,
        references: { model: 'loans', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      return_date: { type: Sequelize.DATE, defaultValue: Sequelize.NOW, allowNull: false },
      condition: { 
        type: Sequelize.ENUM('baik', 'rusak_ringan', 'rusak_berat', 'hilang'), 
        defaultValue: 'baik',
        allowNull: false 
      },
      fine_amount: { 
        type: Sequelize.DECIMAL(10, 2), 
        defaultValue: 0, 
        allowNull: false 
      },
      notes: { type: Sequelize.TEXT },
      processed_by: { 
        type: Sequelize.INTEGER,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('returns');
  }
};