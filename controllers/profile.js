const Utils = require("../utils/utils");
exports.getProfile = (req, res, next) => {
  const user = { ...req.user._doc };
  user.doB = Utils.DATE_UTILS.stringDate1(user.doB);
  user.startDate = Utils.DATE_UTILS.stringDate1(user.startDate);
  res.render("profile", {
    pageTitle: "Profile",
    user: user,
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

exports.postEditProfile = (req, res, next) => {
  console.log(req.body);
  req.user.imageUrl = req.body.imageUrl;
  req.user
    .save()
    .then((result) => {
      res.redirect("/profile");
    })
    .catch((err) => console.log(err));
};
