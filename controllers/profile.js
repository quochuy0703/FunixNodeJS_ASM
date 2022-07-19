exports.getProfile = (req, res, next) => {
  res.render("profile", {
    pageTitle: "Profile",
    user: req.user,
    path: "/profile",
    edit: false,
  });
};

exports.getEditProfile = (req, res, next) => {
  res.render("profile", {
    pageTitle: "Profile",
    user: req.user,
    path: "/profile",
    edit: true,
  });
};
