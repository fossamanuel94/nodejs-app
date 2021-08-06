const express = require("express");
const app = express.Router();
const connection = require("../DBConnection/dbConnection");

app.get("/get-categories", (req, res) => {
  connection.query(`SELECT * 
  FROM categories`, 
  (err, rows) => {
    if (err) {
      res.json({ error: err });
    } else {
      res.json({ data: rows });
    }
  });
});

app.get("/categorie-post/:id", (req, res) => {
  const id = req.params.id;
  connection.query(
    `SELECT * 
    FROM posts 
    WHERE id_categorie="${id}"
    ORDER BY post_date DESC`,
    
    (err, rows) => {
      if (err) res.json(err);
      else res.json({ data: rows });
    }
  );
});

module.exports = app;
