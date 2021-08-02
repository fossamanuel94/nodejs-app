const express = require("express");
const app = express.Router();
const jwt = require("jsonwebtoken");
const connection = require("../DBConnection/dbConnection");
const {generateAccessToken} = require("../Authentication/jwtMiddleware")
const bcrypt = require("bcrypt");
const saltRounds = 10;


app.get("/users", (req, res) => {
  connection.query(`SELECT * FROM users`, 
  (err, rows, fields) => {
    if (err) {
      res.json(err);
    } else if (rows) {
      res.json(rows);
    } else {
      res.send(fields);
    }
  });
});

app.get("/email-validation/:email", (req, res) => {
  const email = req.params.email;
  connection.query(
    `SELECT user_email 
    FROM users 
    WHERE user_email='${email}'`,
    (err, rows) => {
      if (err) res.send(err);
      else res.send(rows[0]);
    }
  );
});

app.get("/nick-validation/:nick", (req, res) => {
  const nick = req.params.nick;
  connection.query(
    `SELECT user_nickname 
    FROM users 
    WHERE user_nickname='${nick}'`,
    (err, rows) => {
      if (err) res.send(err);
      else res.send(rows[0]);
    }
  );
});

app.post("/add-user", async (req, res) => {
  const name = req.body.user_name;
  const email = req.body.user_email;
  const nickname = req.body.user_nickname;
  const pw = await bcrypt.hash(req.body.user_password, saltRounds);

  connection.query(
    `SELECT * 
    FROM users 
    WHERE user_email="${email}"`,
    (err, rows) => {
      if (err) res.send(err);
      if (rows[0] != null) res.send("El Email ya utilizado, pruebe con otro");
      connection.query(
        `SELECT * 
        FROM users 
        WHERE user_nickname="${nickname}"`,
        (err, rows) => {
          if (err) res.send(err);
          if (rows[0] != null)
            res.send("El Nickname ya esta utilizado, pruebe con otro");
          else {
            connection.query(
              `INSERT INTO users 
              VALUES (null, "${name}","${email}","${pw}","${nickname}","2")`,
              (err) => {
                if (err) res.send(err);
                else res.send("Usuario agregado con exito");
              }
            );
          }
        }
      );
    }
  );
});

app.post("/login", (req, res) => {
  var email = req.body.user_email;
  var pw = req.body.user_pw;

  connection.query(
    `SELECT id_user,user_name, user_email, user_password, user_nickname 
    FROM users 
    WHERE user_email="${email}"`,
    (err, rows) => {
      if (err) res.send(err);
      if (rows[0] == null)
        res.status(202).json({ message: "Email inexistente" });
      else {
        bcrypt.compare(pw, rows[0].user_password, (err, hashResult) => {
          if (hashResult) {
            const user = {
              id_user: rows[0].id_user,
              mail: rows[0].user_email,
              pass: rows[0].user_password,
            };
            const tokenA = generateAccessToken(user);
            const tokenR = jwt.sign({ user }, "secretKeyRefresh");
            const tokens = { tokenA, tokenR };
            res.status(200).json({ name: rows[0].user_nickname, tokens });
          } else res.status(202).json({ message: "Contrasena erronea" });
        });
      }
    }
  );
});

module.exports = app;
