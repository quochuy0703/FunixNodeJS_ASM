exports.getAttendance = (req, res, next) => {
  res.render("attendance", { pageTitle: "Attendance" });
};
