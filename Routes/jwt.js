const express = require("express");
const app = express.Router();
const {verifyToken} = require("../Authentication/jwtMiddleware")

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

  module.exports = app;