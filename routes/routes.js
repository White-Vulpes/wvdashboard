const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const api = require("./api/api");
const auth = require("../middleware/auth");
const wsapi = require("./ws/api");
const { slack, PRIORITY } = require("../middleware/slack");

console.log(process.env.MODE);

router.post(
  "/login",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").not().isEmpty(),
  ],
  api.login
);
router.post(
  "/signup",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").not().isEmpty(),
    check("name", "Password is required").not().isEmpty(),
  ],
  api.signup
);

router.post("/getDashboard", auth.checkAuth, api.getDashboard);
router.post(
  "/deleteImages",
  auth.checkAuth,
  api.deleteThumbnails,
  api.deleteImages,
  api.deleteImagesDB
);

router.post("/test", (req, res) => {
  try {
    throw new TypeError("Cannot read property 'foo' of undefined");
  } catch (e) {
    slack.sendErrorMessage(e, "fetchAdminQueries", PRIORITY.HIGH);
    res.status(200).json({ message: "success" });
  }
});

//Websockets
router.ws("/upload", wsapi.upload);

module.exports = router;
