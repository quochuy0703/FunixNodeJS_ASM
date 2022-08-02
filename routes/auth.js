const express = require("express");

const Router = express.Router();

const authControllers = require("../controllers/auth");

const { check, body } = require("express-validator/check");

Router.get("/login", authControllers.getLogin);
Router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .withMessage("Kiểm tra email và nhập lại một email hợp lệ!")
      .normalizeEmail(),
    body("password", "Mật khẩu chưa hợp lệ!").isLength({ min: 5 }).trim(),
  ],
  authControllers.postLogin
);
Router.post("/logout", authControllers.postLogout);

module.exports = Router;
