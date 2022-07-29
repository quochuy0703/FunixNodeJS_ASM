const express = require("express");

const Router = express.Router();

const authControllers = require("../controllers/auth");

Router.get("/login", authControllers.getLogin);
Router.post("/login", authControllers.postLogin);
Router.post("/logout", authControllers.postLogout);

module.exports = Router;
