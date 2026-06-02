'use strict';

/**
 * Menyesuaikan kolom role ke ENUM('admin','user') tanpa menghapus data existing.
 * Mengonversi nilai lama 'peminjam' -> 'user' jika ada.
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const table = await queryInterface.describeTable('users');
    const dialect = queryInterface.sequelize.getDialect();

    if (!table.role) {
      await queryInterface.addColumn('users', 'role', {
        type: Sequelize.ENUM('admin', 'user'),
        allowNull: false,
        defaultValue: 'user',
      });
      return;
    }

    // Normalisasi nilai role lama sebelum mengubah ENUM
    await queryInterface.sequelize.query(
      "UPDATE users SET role = 'user' WHERE role IN ('peminjam', 'member', 'borrower') OR role IS NULL"
    );

    if (dialect === 'mysql') {
      await queryInterface.sequelize.query(
        "ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'user') NOT NULL DEFAULT 'user'"
      );
    } else if (dialect === 'postgres') {
      await queryInterface.sequelize.query(
        "ALTER TYPE \"enum_users_role\" RENAME TO \"enum_users_role_old\""
      ).catch(() => {});
      await queryInterface.changeColumn('users', 'role', {
        type: Sequelize.ENUM('admin', 'user'),
        allowNull: false,
        defaultValue: 'user',
      });
    } else {
      await queryInterface.changeColumn('users', 'role', {
        type: Sequelize.ENUM('admin', 'user'),
        allowNull: false,
        defaultValue: 'user',
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const dialect = queryInterface.sequelize.getDialect();

    if (dialect === 'mysql') {
      await queryInterface.sequelize.query(
        "ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'peminjam') NOT NULL DEFAULT 'peminjam'"
      );
      await queryInterface.sequelize.query(
        "UPDATE users SET role = 'peminjam' WHERE role = 'user'"
      );
    } else {
      await queryInterface.changeColumn('users', 'role', {
        type: Sequelize.ENUM('admin', 'peminjam'),
        allowNull: false,
        defaultValue: 'peminjam',
      });
    }
  },
};
