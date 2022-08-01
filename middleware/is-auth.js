exports.isAuth = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    console.log("not auth");
    return res.redirect("/login");
  }
  next();
};

exports.isManager = (req, res, next) => {
  if (!req.session.user.isManager) {
    console.log("not permission");
    return res.redirect("/");
  }
  next();
};
