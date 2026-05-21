'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const db = {};

// ✅ Import dari config/database.js
const sequelize = require('../config/database');

// Load semua model
fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// Setup associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// === RELASI MODEL ===
// User ↔ Loan
if (db.User && db.Loan) {
  db.User.hasMany(db.Loan, { foreignKey: 'user_id', as: 'loans' });
  db.Loan.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });
}

// Book ↔ Loan
if (db.Book && db.Loan) {
  db.Book.hasMany(db.Loan, { foreignKey: 'book_id', as: 'loans' });
  db.Loan.belongsTo(db.Book, { foreignKey: 'book_id', as: 'book' });
}

// Loan ↔ Return
if (db.Loan && db.Return) {
  db.Loan.hasOne(db.Return, { foreignKey: 'loan_id', as: 'return' });
  db.Return.belongsTo(db.Loan, { foreignKey: 'loan_id', as: 'loan' });
}

// Return ↔ User (processor)
if (db.Return && db.User) {
  db.Return.belongsTo(db.User, { foreignKey: 'processed_by', as: 'processor' });
}
// === END RELASI ===

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;