const jwt = require("../middleware/jwt");

const auth = {
  checkAuth: (req, res, next) => {
    try {
      if (req.header("Authorization")) {
        jwt.verifyToken(req.header("Authorization").split(" ")[1]);
        next();
      } else {
        res.status(400).json({ message: "User not authorized" });
      }
    } catch (e) {
      console.log(e);
      res.status(400).json({ message: "User not authorized" });
    }
  },
  checkAuthWs: (ws, req) => {
    try {
      if (req.header("Authorization")) {
        jwt.verifyToken(req.header("Authorization").split(" ")[1]);
        return true;
      } else {
        ws.send("User not authorized");
        ws.close();
        return false;
      }
    } catch (e) {
      console.log(e);
      ws.send("User not authorized");
      ws.close();
      return false;
    }
  },
};

module.exports = auth;
