const express = require("express");

const isAuth = require("../middleware/is-auth");

const Router = express.Router();

const attendanceControllers = require("../controllers/attendance");

Router.get("/", isAuth, attendanceControllers.getAttendance);
Router.post("/checkin", isAuth, attendanceControllers.postCheckIn);
Router.post("/checkout", isAuth, attendanceControllers.postCheckOut);
Router.get("/leave", isAuth, attendanceControllers.getLeave);
Router.post("/leave", isAuth, attendanceControllers.postLeave);

module.exports = Router;
