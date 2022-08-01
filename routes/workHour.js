const express = require("express");

const Router = express.Router();

const isAuth = require("../middleware/is-auth");

const workHoursControllers = require("../controllers/workHour");

Router.get("/", isAuth.isAuth, workHoursControllers.getWorkHours);
Router.get(
  "/annual-leaves",
  isAuth.isAuth,
  workHoursControllers.getAnnualLeave
);
Router.get("/salary", isAuth.isAuth, workHoursControllers.getSalary);
Router.post("/salary", isAuth.isAuth, workHoursControllers.postSalary);
Router.get("/search", isAuth.isAuth, workHoursControllers.getSearch);
Router.post("/search", isAuth.isAuth, workHoursControllers.postSearch);
Router.post("/page-size", isAuth.isAuth, workHoursControllers.postPageSize);

module.exports = Router;
