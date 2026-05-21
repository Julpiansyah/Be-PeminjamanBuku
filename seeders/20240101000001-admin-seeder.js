'use strict';
const passwordHash = require('password-hash');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('users', [{
      name: 'Administrator',
      email: 'admin@library.com',
      password: passwordHash.generate('admin123'),
      role: 'admin',
      phone: '081234567890',
      address: 'Perpustakaan Pusat',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    }], {});
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('users', { 
      email: 'admin@library.com' 
    }, {});
  }
};