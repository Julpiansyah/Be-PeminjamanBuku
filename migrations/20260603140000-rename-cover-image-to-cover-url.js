'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.renameColumn('books', 'cover_image', 'cover_url');
  },

  async down(queryInterface) {
    await queryInterface.renameColumn('books', 'cover_url', 'cover_image');
  },
};
