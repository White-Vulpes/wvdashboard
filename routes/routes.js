const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const api = require("../middleware/api");
const auth = require("../middleware/auth");
const wsapi = require("../middleware/ws");
const { slack, PRIORITY } = require("../helpers/slack");

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

//Websockets
router.ws("/upload", wsapi.upload);

module.exports = router;
