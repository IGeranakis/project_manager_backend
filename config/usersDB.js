// db/usersDB.js
const { Sequelize } = require('sequelize');

const usersDB = new Sequelize('project_management_users', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
});

// const usersDB = new Sequelize('insight_db', 'insight_user', '^xfij)QcJbi@', {
//   host: '5.77.39.26',
//   dialect: 'mysql',
//   port:3306
// });
module.exports = usersDB;
