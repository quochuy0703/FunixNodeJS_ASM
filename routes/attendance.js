const express = require("express");

const isAuth = require("../middleware/is-auth");

const Router = express.Router();

const attendanceControllers = require("../controllers/attendance");

Router.get("/", isAuth.isAuth, attendanceControllers.getAttendance);
Router.post("/checkin", isAuth.isAuth, attendanceControllers.postCheckIn);
Router.post("/checkout", isAuth.isAuth, attendanceControllers.postCheckOut);
Router.get("/leave", isAuth.isAuth, attendanceControllers.getLeave);
Router.post("/leave", isAuth.isAuth, attendanceControllers.postLeave);

module.exports = Router;
