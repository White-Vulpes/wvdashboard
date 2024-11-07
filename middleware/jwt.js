"use strict";
const fs = require("fs");
const jwt = require("jsonwebtoken");
const { slack, PRIORITY } = require("./slack");
const privateKey = fs.readFileSync("privatekey.pem", "utf8");
const publicKey = fs.readFileSync("publickey.pem", "utf8");

const jwtOptions = {
  issuer: "WVDashboard", // Issuer
  expiresIn: "12h", // Time the JWT will be valid
  algorithm: "RS256", // RSASSA [ "RS256", "RS384", "RS512" ]
};

const jwtHelper = {
  createToken: (claims) => {
    try {
      const token = jwt.sign({ claims: claims }, privateKey, jwtOptions);
      return token;
    } catch (e) {
      throw e;
    }
  },
  verifyToken: (token) => {
    try {
      const data = jwt.verify(token, publicKey);
      return data;
    } catch (e) {
      throw e;
    }
  },
};

module.exports = jwtHelper;
