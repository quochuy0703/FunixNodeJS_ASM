const Utils = require("../utils/utils");

//GET --> /profile
exports.getProfile = (req, res, next) => {
  const user = { ...req.user._doc };
  user.doB = Utils.DATE_UTILS.stringDate1(user.doB);
  user.startDate = Utils.DATE_UTILS.stringDate1(user.startDate);
  res.render("profile", {
    pageTitle: "Thông tin nhân viên",
    user: user,
    path: "/profile",
    edit: false,
  });
};

//GET --> /profile/edit
exports.getEditProfile = (req, res, next) => {
  res.render("profile", {
    pageTitle: "Thông tin nhân viên",
    user: req.user,
    path: "/profile",
    edit: true,
  });
};

//POST --> /profile/edit
exports.postEditProfile = (req, res, next) => {
  const image = req.file;
  if (!image) {
    return res.redirect("/profile");
  }
  req.user.imageUrl = image.path;
  req.user
    .save()
    .then((result) => {
      res.redirect("/profile");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
