const express = require("express");

const Router = express.Router();

const isAuth = require("../middleware/is-auth");

const covidControllers = require("../controllers/covid");

Router.get("/", isAuth, covidControllers.getCovid);
Router.post("/temp", isAuth, covidControllers.postTemp);
Router.get("/injection", isAuth, covidControllers.getInjection);
Router.post("/injection", isAuth, covidControllers.postInjection);
Router.get("/info-covid", isAuth, covidControllers.getCovidInfo);
Router.post("/info-covid", isAuth, covidControllers.postCovidInfo);
Router.get("/info-staff", isAuth, covidControllers.getCovidStaff);

module.exports = Router;
