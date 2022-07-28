const isAuth = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    console.log("not auth");
    return res.redirect("/login");
  }
  next();
};

module.exports = isAuth;
