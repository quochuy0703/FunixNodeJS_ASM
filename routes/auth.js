const express = require("express");

const Router = express.Router();

const authControllers = require("../controllers/auth");

Router.get("/login", authControllers.getLogin);
Router.post("/login", authControllers.postLogin);
Router.get("/signup", authControllers.getSignup);

module.exports = Router;
