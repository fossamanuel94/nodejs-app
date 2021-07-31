const express = require("express");
const app = express.Router();
const jwt = require("jsonwebtoken");
const connection = require("../DBConnection/dbConnection");
const verifyToken = require("../Authentication/jwtMiddleware")

app.post("/add-post", verifyToken, (req, res) => {
  const { post_desc, post_title, post_subtitle, post_image, post_categ } =
    req.body;
  const fecha = moment().format("YYYY-MM-DD HH:mm:ss");
  jwt.verify(req.token, "secretKey", (err, data) => {
    if (err) res.send(err);
    if (post_categ === "") {
      post_categ = "1";
    }
    //console.log(data, req.body);
    connection.query(
      `INSERT INTO posts VALUES 
        (null, "${data.id_user}","${post_desc}","${post_title}","${post_subtitle}","${post_image}","${fecha}","${post_categ}")`,
      (err, rows) => {
        if (err) res.send(err);
        else res.send("Post guardado con exito");
      }
    );
  });
});

app.get("/post/:id", (req, res) => {
  const id = req.params.id;
  connection.query(
    `SELECT p.id_post, p.post_title, p.post_subtitle, p.post_desc, p.post_image, p.post_date, u.user_nickname, c.categorie, c.id_categorie 
    FROM posts AS p 
    INNER JOIN users AS u 
    ON p.id_user=u.id_user 
    INNER JOIN categories AS c 
    ON p.id_categorie=c.id_categorie 
    WHERE p.id_post="${id}"`,
    (err, rows) => {
      if (err) {
        res.json({ error: err });
      } else {
        res.json({ result: rows[0] });
      }
    }
  );
});

app.get("/all-posts", (req, res) => {
  connection.query(
    `SELECT p.id_post, p.post_title, p.post_subtitle, p.post_desc, p.post_image, p.post_date, u.user_nickname, c.categorie 
    FROM posts AS p 
    INNER JOIN users AS u 
    ON p.id_user=u.id_user 
    INNER JOIN categories AS c 
    ON p.id_categorie=c.id_categorie 
    ORDER BY p.post_date DESC`,
    (err, rows) => {
      if (err) {
        res.json({ error: err });
      } else {
        res.json({ result: rows });
      }
    }
  );
});

app.get("/latest-posts", (req, res) => {
  connection.query(
    `SELECT * FROM posts 
    ORDER BY post_date DESC LIMIT 3`,
    (err, rows) => {
      if (err) res.json({ error: err });
      else res.json({ result: rows });
    }
  );
});

module.exports = app;
