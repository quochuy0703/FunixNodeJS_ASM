const express = require("express");

const Router = express.Router();

const covidControllers = require("../controllers/covid");

Router.get("/", covidControllers.getCovid);
Router.post("/temp", covidControllers.postTemp);
Router.get("/injection", covidControllers.getInjection);
Router.post("/injection", covidControllers.postInjection);
Router.get("/info-covid", covidControllers.getCovidInfo);
Router.post("/info-covid", covidControllers.postCovidInfo);

module.exports = Router;
