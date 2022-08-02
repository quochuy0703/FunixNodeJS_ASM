const User = require("../models/user");

const bcryptjs = require("bcryptjs");

const { validationResult } = require("express-validator/check");

exports.getLogin = (req, res, next) => {
  res.render("login", {
    pageTitle: "Login",
    path: "/login",
    errorMessage: null,
    oldInput: { email: "", password: "" },
  });
};

exports.postLogin = (req, res, next) => {
  const password = req.body.password;
  const email = req.body.email;
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(422).render("login", {
      pageTitle: "Login",
      path: "/login",
      errorMessage: error.array()[0].msg,
      oldInput: { email: email, password: password },
    });
  }
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        return res.status(422).render("login", {
          pageTitle: "Login",
          path: "/login",
          errorMessage: "Email hoặc mật khẩu không đúng!",
          oldInput: { email: email, password: password },
        });
      }
      bcryptjs.compare(password, user.password).then((doMatch) => {
        if (doMatch) {
          req.session.isLoggedIn = true;
          req.session.pageSize = 10;
          req.session.user = user;
          return req.session.save((err) => {
            console.log(err);
            res.redirect("/");
          });
        }
        return res.status(422).render("login", {
          pageTitle: "Login",
          path: "/login",
          errorMessage: "Email hoặc mật khẩu không đúng!",
          oldInput: { email: email, password: password },
        });
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};
