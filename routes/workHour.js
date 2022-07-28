const express = require("express");

const Router = express.Router();

const isAuth = require("../middleware/is-auth");

const workHoursControllers = require("../controllers/workHour");

Router.get("/", isAuth, workHoursControllers.getWorkHours);
Router.get("/annual-leaves", isAuth, workHoursControllers.getAnnualLeave);
Router.get("/salary", isAuth, workHoursControllers.getSalary);
Router.post("/salary", isAuth, workHoursControllers.postSalary);
Router.get("/search", isAuth, workHoursControllers.getSearch);
Router.post("/search", isAuth, workHoursControllers.postSearch);

module.exports = Router;
