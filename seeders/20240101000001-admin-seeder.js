'use strict';
const passwordHash = require('password-hash');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const [existing] = await queryInterface.sequelize.query(
      "SELECT id FROM users WHERE username = 'admin' LIMIT 1"
    );
    if (existing.length > 0) {
      return;
    }

    await queryInterface.bulkInsert('users', [{
      name: 'Administrator',
      username: 'admin',
      password: passwordHash.generate('admin123'),
      role: 'admin',
      created_at: new Date(),
      updated_at: new Date(),
    }], {});
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('users', {
      username: 'admin',
    }, {});
  }
};