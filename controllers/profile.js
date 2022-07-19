exports.getProfile = (req, res, next) => {
  res.render("profile", { pageTitle: "Profile", user: req.user, edit: false });
};

exports.getEditProfile = (req, res, next) => {
  res.render("profile", { pageTitle: "Profile", user: req.user, edit: true });
};
