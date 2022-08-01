const express = require("express");

const Router = express.Router();

const isAuth = require("../middleware/is-auth");

const profileControllers = require("../controllers/profile");

Router.get("/", isAuth.isAuth, profileControllers.getProfile);
Router.get("/edit", isAuth.isAuth, profileControllers.getEditProfile);
Router.post("/edit", isAuth.isAuth, profileControllers.postEditProfile);

module.exports = Router;
