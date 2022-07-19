const express = require("express");

const Router = express.Router();

const profileControllers = require("../controllers/profile");

Router.get("/", profileControllers.getProfile);
Router.get("/edit", profileControllers.getEditProfile);
Router.post("/edit", profileControllers.postEditProfile);

module.exports = Router;
