'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('loans', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: { 
        type: Sequelize.INTEGER, 
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      book_id: { 
        type: Sequelize.INTEGER, 
        allowNull: false,
        references: { model: 'books', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      loan_date: { type: Sequelize.DATE, defaultValue: Sequelize.NOW, allowNull: false },
      due_date: { type: Sequelize.DATE, allowNull: false },
      return_date: { type: Sequelize.DATE },
      status: { 
        type: Sequelize.ENUM('dipinjam', 'dikembalikan', 'terlambat'), 
        defaultValue: 'dipinjam',
        allowNull: false 
      },
      notes: { type: Sequelize.TEXT },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    // Index untuk query yang sering digunakan
    await queryInterface.addIndex('loans', ['user_id', 'status']);
    await queryInterface.addIndex('loans', ['book_id', 'status']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('loans');
  }
};