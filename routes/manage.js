const express = require("express");

const Router = express.Router();
const isAuth = require("../middleware/is-auth");

const manageControllers = require("../controllers/manage");

Router.get("/", isAuth.isAuth, isAuth.isManager, manageControllers.getManage);
Router.get(
  "/staff/:id",
  isAuth.isAuth,
  isAuth.isManager,
  manageControllers.getManageStaff
);
Router.post(
  "/staff/:id",
  isAuth.isAuth,
  isAuth.isManager,
  manageControllers.postManageStaff
);
Router.post(
  "/confirm/staff/:id",
  isAuth.isAuth,
  isAuth.isManager,
  manageControllers.postManageConfirmStaff
);
Router.get(
  "/edit/staff/:id",
  isAuth.isAuth,
  isAuth.isManager,
  manageControllers.getManageEditStaff
);

module.exports = Router;
