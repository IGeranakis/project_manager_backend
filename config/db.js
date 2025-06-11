const mysql = require('mysql2/promise');

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'project_management',
  port: 3306
});

// const db = mysql.createPool({
//   host: '5.77.39.26',
//   user: 'mproj_user3',
//   password: 'lMHSc{0Os+lk',
//   database: 'mproj_db2023',
//   port: 3306
// });

module.exports = db;