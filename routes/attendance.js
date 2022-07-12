const express = require("express");

const Router = express.Router();

const attendanceControllers = require("../controllers/attendance");

Router.get("/", attendanceControllers.getAttendance);

module.exports = Router;
