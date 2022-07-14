const express = require("express");

const Router = express.Router();

const workHoursControllers = require("../controllers/workHour");

Router.get("/", workHoursControllers.getWorkHours);

module.exports = Router;
