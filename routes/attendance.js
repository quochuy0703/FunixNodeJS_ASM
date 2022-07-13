const express = require("express");

const Router = express.Router();

const attendanceControllers = require("../controllers/attendance");

Router.get("/", attendanceControllers.getAttendance);
Router.post("/checkin", attendanceControllers.postCheckIn);
Router.post("/checkout", attendanceControllers.postCheckOut);
Router.get("/leave", attendanceControllers.getLeave);
Router.post("/leave", attendanceControllers.postLeave);

module.exports = Router;
