const WorkedHour = require("../models/workedHour");
const AnualLeave = require("../models/anualLeave");

exports.getAttendance = (req, res, next) => {
  let stringDate = null;
  if (req.user.isWork) {
    WorkedHour.findOne({ _id: req.user.currentWorkHour })
      .then((workHour) => {
        const date = new Date(workHour.startHour);
        stringDate = date.getHours() + ":" + date.getMinutes();
        res.render("attendance", {
          pageTitle: "Attendance",
          isWork: req.user.isWork,
          startDate: stringDate,
        });
      })
      .catch((err) => console.log(err));
  } else {
    res.render("attendance", {
      pageTitle: "Attendance",
      isWork: req.user.isWork,
      startDate: stringDate,
    });
  }
};

exports.postCheckIn = (req, res, next) => {
  console.log(req.body);
  const work = new WorkedHour({
    userId: req.user,
    startHour: Date.now(),
    endHour: null,
    workPlace: parseInt(req.body.workPlace),
  });
  return work
    .save()

    .then((result) => {
      req.user.isWork = true;
      req.user.currentWorkHour = result;
      return req.user.save();
    })
    .then((result) => {
      res.redirect("/");
    })
    .catch((err) => console.log(err));
};

exports.postCheckOut = (req, res, next) => {
  console.log(req.body);
  WorkedHour.findOne({ _id: req.user.currentWorkHour })
    .then((workHour) => {
      workHour.endHour = Date.now();
      req.user.isWork = false;
      req.user.currentWorkHour = null;
      return workHour.save();
    })
    .then((result) => {
      return req.user.save();
    })

    .then((result) => {
      res.redirect("/");
    })
    .catch((err) => console.log(err));
};

exports.getLeave = (req, res, next) => {
  res.render("leave", { pageTitle: "Leave", user: req.user });
};

exports.postLeave = (req, res, next) => {
  console.log(req.body);
  const startLeaveDate = req.body.startLeaveDate;
  const anteLeaveStart = req.body.anteLeaveStart === "1" ? true : false;
  const endLeaveDate = req.body.endLeaveDate;
  const anteLeaveEnd = req.body.anteLeaveEnd === "1" ? true : false;
  const reasonLeave = req.body.reasonLeave;

  const diffdate = new Date(endLeaveDate) - new Date(startLeaveDate);
  let countDay = new Date(diffdate).getDate();
  countDay = countDay - 1;
  if (diffdate < 0) {
    return res.redirect("/leave");
  }
  if (!anteLeaveStart) {
    countDay = countDay - 0.5;
  }
  if (!anteLeaveEnd) {
    countDay = countDay + 0.5;
  }

  console.log(countDay);

  if (req.user.anualLeave < countDay) {
    return res.redirect("/leave");
  }

  const anual = new AnualLeave({
    userId: req.user,
    startDateLeave: new Date(startLeaveDate),
    isMorningStartDate: anteLeaveStart,
    endDateLeave: new Date(endLeaveDate),
    isMorningEndDate: anteLeaveEnd,
    reasonLeave: reasonLeave,
    countDay: countDay,
  });
  return anual
    .save()
    .then((result) => {
      req.user.annualLeave = req.user.annualLeave - countDay;
      return req.user.save();
    })
    .then((result) => {
      res.redirect("/");
    })
    .catch((err) => console.log(err));
};
