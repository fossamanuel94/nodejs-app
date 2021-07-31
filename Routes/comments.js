const express = require("express");
const app = express.Router();
const jwt = require("jsonwebtoken");
const verifyToken = require("../Authentication/jwtMiddleware")
const connection = require("../DBConnection/dbConnection");

app.get("/:id", (req, res) => {
  const id = req.params.id;
  connection.query(
    `SELECT c.id_comment, c.comment, c.comment_date, u.user_nickname 
    FROM comments AS c 
    INNER JOIN users AS u 
    ON c.id_user = u.id_user 
    WHERE c.id_post ="${id}" 
    ORDER BY c.comment_date 
    DESC`,
    (err, rows) => {
      if (err) res.send(err);
      else res.json({ result: rows });
    }
  );
});

app.post("/add-comment", verifyToken, (req, res) => {
  const fecha = moment().format("YYYY-MM-DD HH:mm:ss");
  const { id_post, comment } = req.body;
  jwt.verify(req.token, "secretKey", (err, data) => {
    if (err) res.send(err);
    if (err) res.send(err);
    connection.query(
      `INSERT INTO comments VALUES (null, "${data.id_user}","${id_post}","${comment}","${fecha}")`,
      (err, rows) => {
        if (err) res.send(err);
        else res.send("Comentario guardado con exito");
      }
    );
  });
});

module.exports = app;
