'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('books', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: { type: Sequelize.STRING(200), allowNull: false },
      author: { type: Sequelize.STRING(100), allowNull: false },
      isbn: { type: Sequelize.STRING(50), unique: true },
      publisher: { type: Sequelize.STRING(100) },
      year: { type: Sequelize.INTEGER },
      category: { type: Sequelize.STRING(50) },
      description: { type: Sequelize.TEXT },
      stock: { 
        type: Sequelize.INTEGER, 
        defaultValue: 0, 
        allowNull: false 
      },
      cover_image: { type: Sequelize.STRING(255) },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('books');
  }
};