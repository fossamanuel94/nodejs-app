const express = require("express");
const app = express();
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const saltRounds = 10;

app.use(express.json());
app.use(cors());

const pool = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "test2",
});

function verifyToken(req, res, next) {
  const bearerHeader = req.headers["authorization"];
  //console.log(bearerHeader)
  if (typeof bearerHeader !== "undefined") {
    const bearerToken = bearerHeader.split(" ")[1];
    req.token = bearerToken;
    next();
  } else {
    res.json({ message: "Error" });
  }
}

function generateAccessToken(user) {
  return jwt.sign(user, "secretKey", { expiresIn: "60s" });
}

app.post("/token", (req, res) => {
  const refreshToken = req.body.token;
  //console.log(refreshToken)
  if (refreshToken == "undefined") {
    res.sendStatus(401);
  }
  jwt.verify(refreshToken, "secretKeyRefresh", (err, user) => {
    if (err) {
      res.json(err);
    } else {
      const accessToken = generateAccessToken(user.user);
      res.json({ tokenA: accessToken });
    }
  });
});

app.post("/jwt-ejemplo", verifyToken, (req, res) => {
  jwt.verify(req.token, "secretKey", (err, data) => {
    if (err) res.send(err);
    else res.json(data);
  });
});

app.get("/users", (req, res) => {
  pool.query("SELECT * FROM users", (err, rows, fields) => {
    if (err) {
      res.json(err);
    } else if (rows) {
      res.json(rows);
    } else {
      res.send(fields);
    }
  });
});

app.post("/add-user", async (req, res) => {
  const name = req.body.user_name;
  const email = req.body.user_email;
  const pw = await bcrypt.hash(req.body.user_password, saltRounds);

  pool.query(
    "SELECT * FROM users WHERE user_email='" + email + "'",
    (err, rows) => {
      if (err) res.send(err);
      if (rows[0] != null) res.send("Email ya utilizado, pruebe con otro");
      else {
        pool.query(
          "INSERT INTO users VALUES(null, '" +
            name +
            "','" +
            email +
            "','" +
            pw +
            "')",
          (err) => {
            if (err) res.send(err);
            else res.send("Usuario agregado con exito");
          }
        );
      }
    }
  );
});

app.post("/login", (req, res) => {
  var email = req.body.user_email;
  var pw = req.body.user_pw;

  pool.query(
    "SELECT id_user,user_name, user_email, user_password FROM users WHERE user_email='" +
      email +
      "'",
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
            res.status(200).json({ name: rows[0].user_name, tokens });
          } else res.status(202).json({ message: "Contrasena erronea" });
        });
      }
    }
  );
});

app.post("/add-post", verifyToken, (req, res) => {
  jwt.verify(req.token, "secretKey", (err, data) => {
    if (err) res.send(err);
    else {
      pool.query(
        "INSERT INTO posts VALUES (null, '" +
          data.id_user +
          "','" +
          req.body.post_desc +
          "','" +
          req.body.post_title +
          "','" +
          req.body.post_image +
          "')",
        (err, rows) => {
          if (err) res.send("No se pudo guardar el post");
          else res.send("Post guardado con exito");
        }
      );
    }
  });
});

app.get("/post/:id", (req, res) => {
  const id = req.params.id;
  pool.query(
    "SELECT post_desc, post_title FROM posts WHERE id_post = '" + id + "'",
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
  pool.query(
    "SELECT id_post, post_desc, post_title, post_image FROM posts",
    (err, rows) => {
      if (err) {
        res.json({ error: err });
      } else {
        res.json({ result: rows });
      }
    }
  );
});

app.get("/get-categories", (req,res)=>{
  pool.query("SELECT * FROM categories", (err, rows)=>{
    if(err){
      res.json({error:err})
    }else{
      res.json({data:rows})
    }
  })
})

app.listen(8080, () => {
  console.log("Running on port 8080");
});
