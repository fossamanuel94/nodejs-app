const mysql = require("mysql2");

const pool = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "test2",
  });

module.exports= pool;