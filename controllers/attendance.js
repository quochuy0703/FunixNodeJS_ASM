const WorkedHour = require("../models/workedHour");
const AnualLeave = require("../models/anualLeave");

exports.getAttendance = (req, res, next) => {
  let stringDate = null;
  if (req.user.isWork) {
    WorkedHour.findOne({ "sessionWorks._id": req.user.currentWorkHour })
      .select({
        sessionWorks: { $elemMatch: { _id: req.user.currentWorkHour } },
      })
      .then((workHour) => {
        console.log("getAttendance", workHour);
        const date = new Date(workHour.sessionWorks[0].startHour);
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

  const currentDate = new Date();
  let stringDate = `${currentDate.getFullYear()}${
    currentDate.getMonth() + 1
  }${currentDate.getDate()}`;
  WorkedHour.findOne({ workDate: stringDate, userId: req.user._id })
    .then((resultWorkHour) => {
      if (resultWorkHour) {
        resultWorkHour.sessionWorks.push({
          startHour: Date.now(),
          endHour: null,
          workPlace: parseInt(req.body.workPlace),
        });
        return resultWorkHour.save();
      }
      let sessionWork = [];
      let workHour = {};
      workHour.startHour = Date.now();
      workHour.endHour = null;
      workHour.workPlace = parseInt(req.body.workPlace);
      sessionWork.push(workHour);
      const work = new WorkedHour({
        userId: req.user,
        workDate: stringDate,
        sessionWorks: sessionWork,
      });

      return work.save();
    })

    .then((workedHour) => {
      let sessionWorks = workedHour.sessionWorks;
      req.user.isWork = true;
      req.user.currentWorkHour = sessionWorks[sessionWorks.length - 1]._id;
      return req.user.save();
    })
    .then((result) => {
      res.redirect("/");
    })
    .catch((err) => console.log(err));
};

exports.postCheckOut = (req, res, next) => {
  console.log(req.body);
  WorkedHour.findOne({ "sessionWorks._id": req.user.currentWorkHour })
    .select("workHours")
    .select({
      sessionWorks: { $elemMatch: { _id: req.user.currentWorkHour } },
    })
    .then((workHour) => {
      workHour.sessionWorks[0].endHour = Date.now();
      let hourDiff =
        workHour.sessionWorks[0].endHour -
        new Date(workHour.sessionWorks[0].startHour);
      workHour.workHours = workHour.workHours + hourDiff;
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
