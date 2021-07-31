const express = require("express")
const app = express();

const verifyToken = (req, res, next) => {
    const bearerHeader = req.headers["authorization"];
    //console.log(bearerHeader)
    if (typeof bearerHeader === "undefined") res.send("JWT ERROR");
    if (typeof bearerHeader !== "undefined") {
      const bearerToken = bearerHeader.split(" ")[1];
      req.token = bearerToken;
      next();
    } else {
      res.json({ message: "Error" });
    }
  }

module.exports = verifyToken;