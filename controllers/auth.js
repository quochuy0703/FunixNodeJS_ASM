const User = require("../models/user");

const bcryptjs = require("bcryptjs");

exports.getLogin = (req, res, next) => {
  res.render("login", { pageTitle: "Login", path: "/login" });
};

exports.postLogin = (req, res, next) => {
  const password = req.body.password;
  const email = req.body.email;
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        res.redirect("/login");
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
        return res.status(422).redirect("/login");
      });
    })
    .catch((err) => console.log(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};
