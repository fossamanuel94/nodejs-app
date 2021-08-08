const mysql = require("mysql2");

//mysql://b08fcbf7d140de:7291d284@us-cdbr-east-04.cleardb.com/heroku_a54f2b77df421c8?reconnect=true

const connection = mysql.createConnection({
    host: "us-cdbr-east-04.cleardb.com",
    user: "b08fcbf7d140de",
    password:"7291d284",
    database: "heroku_a54f2b77df421c8"
  });


module.exports =  connection;