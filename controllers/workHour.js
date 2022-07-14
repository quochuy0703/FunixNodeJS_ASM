const WorkedHour = require("../models/workedHour");

exports.getWorkHours = (req, res, next) => {
  WorkedHour.find({ userId: req.user._id })
    .then((workedHours) => {
      console.log(workedHours);
      res.render("work-hours", {
        pageTitle: "Work Hour",
        workedHours: workedHours,
      });
    })
    .catch((err) => console.log(err));
};
