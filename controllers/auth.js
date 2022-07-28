const User = require("../models/user");

exports.getLogin = (req, res, next) => {
  res.render("login", { pageTitle: "Login", path: "/login" });
};

exports.postLogin = (req, res, next) => {
  User.findOne({ email: "huy@gmail.com" })
    .then((user) => {
      if (user.password === req.body.password) {
        req.session.isLoggedIn = true;
        req.session.user = user;
        return req.session.save((err) => {
          console.log(err);
          res.redirect("/");
        });
      }
    })
    .catch((err) => console.log(err));
};

exports.getSignup = (req, res, next) => {
  res.render("signup", { pageTitle: "Signup", path: "/signup" });
};

exports.postSignup = (req, res, next) => {
  res.render("signup", { pageTitle: "Signup", path: "/signup" });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};
