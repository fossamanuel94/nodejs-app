const jwt = require("jsonwebtoken");

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


  const generateAccessToken = (user) =>{
    return jwt.sign(user, "secretKey", { expiresIn: "15m" });
  }


module.exports = {
  verifyToken,
  generateAccessToken
}