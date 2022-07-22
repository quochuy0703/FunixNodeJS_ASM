const express = require("express");

const Router = express.Router();

const workHoursControllers = require("../controllers/workHour");

Router.get("/", workHoursControllers.getWorkHours);
Router.get("/annual-leaves", workHoursControllers.getAnnualLeave);
Router.get("/salary", workHoursControllers.getSalary);
Router.post("/salary", workHoursControllers.postSalary);
Router.get("/search", workHoursControllers.getSearch);
Router.post("/search", workHoursControllers.postSearch);

module.exports = Router;
