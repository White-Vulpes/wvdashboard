const jwt = require("../helpers/jwt");
const { AppError, ErrorTypes } = require("../types/errors");

const auth = {
  checkAuth: (req, res, next) => {
    try {
      if (req.header("Authorization")) {
        jwt.verifyToken(req.header("Authorization").split(" ")[1]);
        next();
      } else {
        throw new AppError(
          ErrorTypes.AUTHORIZATION_ERROR,
          "User not authroized"
        );
      }
    } catch (e) {
      error instanceof AppError
        ? error.sendResponse(res)
        : (() => {
            throw new AppError(
              ErrorTypes.AUTHORIZATION_ERROR,
              "User not authroized"
            ).sendResponse(res);
          })();
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
      ws.send("User not authorized");
      ws.close();
      return false;
    }
  },
};

module.exports = auth;
