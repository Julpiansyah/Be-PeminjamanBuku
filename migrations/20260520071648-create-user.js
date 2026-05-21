'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: { type: Sequelize.STRING(100), allowNull: false },
      email: { 
        type: Sequelize.STRING(100), 
        allowNull: false, 
        unique: true 
      },
      password: { type: Sequelize.STRING(255), allowNull: false },
      role: { 
        type: Sequelize.ENUM('admin', 'peminjam'), 
        defaultValue: 'peminjam',
        allowNull: false 
      },
      phone: { type: Sequelize.STRING(20), allowNull: true },
      address: { type: Sequelize.TEXT, allowNull: true },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('users');
  }
};