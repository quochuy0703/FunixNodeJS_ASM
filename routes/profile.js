const express = require("express");

const Router = express.Router();

const isAuth = require("../middleware/is-auth");

const profileControllers = require("../controllers/profile");

Router.get("/", isAuth, profileControllers.getProfile);
Router.get("/edit", isAuth, profileControllers.getEditProfile);
Router.post("/edit", isAuth, profileControllers.postEditProfile);

module.exports = Router;
