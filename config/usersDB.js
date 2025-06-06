// db/usersDB.js
const { Sequelize } = require('sequelize');

const usersDB = new Sequelize('project_management_users', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
});

module.exports = usersDB;
