exports.getAttendance = (req, res, next) => {
  res.render("attendance", {
    pageTitle: "Attendance",
    isWork: req.user.isWork,
  });
};

exports.postCheckIn = (req, res, next) => {
  console.log(req.body);
  req.user.isWork = true;
  req.user
    .save()
    .then((result) => {
      res.redirect("/");
    })
    .catch((err) => console.log(err));
};

exports.postCheckOut = (req, res, next) => {
  console.log(req.body);
  req.user.isWork = false;
  req.user
    .save()
    .then((result) => {
      res.redirect("/");
    })
    .catch((err) => console.log(err));
};
