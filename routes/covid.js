const express = require("express");

const Router = express.Router();

const isAuth = require("../middleware/is-auth");

const covidControllers = require("../controllers/covid");

Router.get("/", isAuth.isAuth, covidControllers.getCovid);
Router.post("/temp", isAuth.isAuth, covidControllers.postTemp);
Router.get("/injection", isAuth.isAuth, covidControllers.getInjection);
Router.post("/injection", isAuth.isAuth, covidControllers.postInjection);
Router.get("/info-covid", isAuth.isAuth, covidControllers.getCovidInfo);
Router.post("/info-covid", isAuth.isAuth, covidControllers.postCovidInfo);
Router.get("/info-staff", isAuth.isAuth, covidControllers.getCovidStaff);
Router.get("/staff/:id", isAuth.isAuth, covidControllers.getCovidStaffInfoPdf);
Router.get(
  "/all-staff",
  isAuth.isAuth,
  covidControllers.getCovidAllStaffInfoPdf
);

module.exports = Router;
