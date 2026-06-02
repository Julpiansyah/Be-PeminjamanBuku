'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const table = await queryInterface.describeTable('users');
    const dialect = queryInterface.sequelize.getDialect();

    // MySQL: bisa atur posisi kolom (AFTER name)
    if (dialect === 'mysql') {
      const addCols = [];

      if (!table.rombel) {
        addCols.push("ADD COLUMN rombel VARCHAR(100) NULL AFTER name");
      }
      if (!table.rayon) {
        // Kalau rombel baru ditambah, rayon harus AFTER rombel. Kalau rombel sudah ada, tetap AFTER rombel.
        addCols.push("ADD COLUMN rayon VARCHAR(100) NULL AFTER rombel");
      }

      if (addCols.length) {
        await queryInterface.sequelize.query(`ALTER TABLE users ${addCols.join(', ')}`);
      }
      return;
    }

    // Dialect lain: posisi kolom tidak dijamin, tapi aman & tidak merusak data existing
    if (!table.rombel) {
      await queryInterface.addColumn('users', 'rombel', {
        type: Sequelize.STRING(100),
        allowNull: true,
      });
    }
    if (!table.rayon) {
      await queryInterface.addColumn('users', 'rayon', {
        type: Sequelize.STRING(100),
        allowNull: true,
      });
    }
  },

  down: async (queryInterface) => {
    const table = await queryInterface.describeTable('users');

    if (table.rayon) {
      await queryInterface.removeColumn('users', 'rayon');
    }
    if (table.rombel) {
      await queryInterface.removeColumn('users', 'rombel');
    }
  },
};

