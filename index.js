const express = require("express");
const app = express();
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const middleware = require('./algo')
const moment = require("moment");
const cors = require("cors");
const saltRounds = 10;

app.use(express.json());
app.use(cors());

const pool = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "test2",
});

app.get("/algo", middleware.algo, (req,res)=>{
  res.json({msg: req.data+" y algo mas"})
})

function verifyToken(req, res, next) {
  const bearerHeader = req.headers["authorization"];
  //console.log(bearerHeader)
  if(typeof bearerHeader === "undefined") res.send("JWT ERROR")
  if (typeof bearerHeader !== "undefined") {
    const bearerToken = bearerHeader.split(" ")[1];
    req.token = bearerToken;
    next();
  } else {
    res.json({ message: "Error" });
  }
}

function generateAccessToken(user) {
  return jwt.sign(user, "secretKey", { expiresIn: "15m" });
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

app.get("/email-validation/:email", (req,res)=>{
  const email = req.params.email
  pool.query(`SELECT user_email FROM users WHERE user_email='${email}'`, (err, rows)=>{
    if(err) res.send(err)
    else res.send(rows[0])
  })
})

app.get("/nick-validation/:nick", (req,res)=>{
  const nick = req.params.nick
  pool.query(`SELECT user_nickname FROM users WHERE user_nickname='${nick}'`, (err, rows)=>{
    if(err) res.send(err)
    else res.send(rows[0])
  })
})

app.post("/add-user", async (req, res) => {
  const name = req.body.user_name;
  const email = req.body.user_email;
  const nickname = req.body.user_nickname;
  const pw = await bcrypt.hash(req.body.user_password, saltRounds);

  pool.query(
    "SELECT * FROM users WHERE user_email='" + email + "'",
    (err, rows) => {
      if (err) res.send(err);
      if (rows[0] != null) res.send("El Email ya utilizado, pruebe con otro");
      pool.query(
        "SELECT * FROM users WHERE user_nickname='" + nickname + "'",
        (err, rows) => {
          if (err) res.send(err);
          if (rows[0] != null)
            res.send("El Nickname ya esta utilizado, pruebe con otro");
          else {
            pool.query(
              "INSERT INTO users VALUES(null, '" +
                name +
                "','" +
                email +
                "','" +
                pw +
                "','" +
                nickname +
                "','" +
                2 +
                "')",
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

  pool.query(
    "SELECT id_user,user_name, user_email, user_password, user_nickname FROM users WHERE user_email='" +
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
            res.status(200).json({ name: rows[0].user_nickname, tokens });
          } else res.status(202).json({ message: "Contrasena erronea" });
        });
      }
    }
  );
});


app.get("/comments/:id", (req,res)=>{
  const id = req.params.id;
  pool.query("SELECT c.id_comment, c.comment, c.comment_date, u.user_nickname FROM comments AS c INNER JOIN users AS u ON c.id_user = u.id_user WHERE c.id_post ='"+id+"' ORDER BY c.comment_date DESC",(err, rows)=>{
    if(err) res.send(err)
    else res.json({result:rows})
  })
})

app.post("/add-comment",verifyToken, (req,res)=>{
  const fecha = moment().format("YYYY-MM-DD HH:mm:ss");
  jwt.verify(req.token, "secretKey", (err,data)=>{
    if(err) res.send(err)
    if(err) res.send(err);
    pool.query("INSERT INTO comments VALUES (null, '" +
      data.id_user+
      "','"+
      req.body.id_post+
      "','"+
      req.body.comment+
      "','"+
      fecha +
      "')",
    (err,rows) =>{
      if(err) res.send(err)
      else res.send("Comentario guardado con exito")
    }
    )
  })
})

app.post("/add-post", verifyToken, (req, res) => {
  const fecha = moment().format("YYYY-MM-DD HH:mm:ss");
  jwt.verify(req.token, "secretKey", (err, data) => {
    if (err) res.send(err);
    if (req.body.post_categ === "") {
      req.body.post_categ = "1";
    }
    console.log(data, req.body);
    pool.query(
      "INSERT INTO posts VALUES (null, '" +
        data.id_user +
        "','" +
        req.body.post_desc +
        "','" +
        req.body.post_title +
        "','" +
        req.body.post_image +
        "','" +
        fecha +
        "','" +
        req.body.post_categ +
        "')",
      (err, rows) => {
        if (err) res.send(err);
        else res.send("Post guardado con exito");
      }
    );
  });
});

app.get("/post/:id", (req, res) => {
  const id = req.params.id;
  pool.query(
    "SELECT p.id_post, p.post_title, p.post_subtitle, p.post_desc, p.post_image, p.post_date, u.user_nickname, c.categorie FROM posts AS p INNER JOIN users AS u ON p.id_user=u.id_user INNER JOIN categories AS c ON p.id_categorie=c.id_categorie WHERE p.id_post='" +
      id +
      "'",
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
    "SELECT p.id_post, p.post_title, p.post_desc, p.post_image, p.post_date, u.user_nickname, c.categorie FROM posts AS p INNER JOIN users AS u ON p.id_user=u.id_user INNER JOIN categories AS c ON p.id_categorie=c.id_categorie ORDER BY p.post_date DESC",
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
  pool.query(
    "SELECT * FROM posts ORDER BY post_date DESC LIMIT 3",
    (err, rows) => {
      if (err) res.json({ error: err });
      else res.json({ result: rows });
    }
  );
});

app.get("/get-categories", (req, res) => {
  pool.query("SELECT * FROM categories", (err, rows) => {
    if (err) {
      res.json({ error: err });
    } else {
      res.json({ data: rows });
    }
  });
});

app.get("/categorie-post/:id", (req, res) => {
  const id = req.params.id;
  pool.query(
    "SELECT * FROM posts WHERE id_categorie='" + id + "'",
    (err, rows) => {
      if (err) res.json(err);
      else res.json({ data: rows });
    }
  );
});



app.listen(8080, () => {
  console.log("Running on port 8080");
});
