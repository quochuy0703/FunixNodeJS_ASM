const WorkedHour = require("../models/workedHour");
const AnualLeave = require("../models/anualLeave");
const Utils = require("../utils/utils");
const Constants = require("../utils/constants");

exports.getAttendance = (req, res, next) => {
  let stringDate = null;
  WorkedHour.getWorkedHourByDate(
    Utils.DATE_UTILS.stringDate1(new Date()),
    req.user._id
  ).then((workedHours) => {
    if (workedHours.length <= 0) {
      return res.render("attendance", {
        pageTitle: "Attendance",
        user: req.user,
        startDate: stringDate,
        workedHour: null,
      });
    }
    const workedHour = workedHours[0];
    if (req.user.isWork) {
      res.render("attendance", {
        pageTitle: "Attendance",
        user: req.user,
        startDate: Utils.DATE_UTILS.DateToHourString(
          workedHour.sessionWorks[workedHour.sessionWorks.length - 1].startHour
        ),
        workedHour: workedHour,
      });
    } else {
      let sumHourDiff = 0;

      workedHour.sessionWorks.forEach((sessionWork) => {
        const hourdiff = sessionWork.endHour - sessionWork.startHour;

        sumHourDiff = sumHourDiff + hourdiff;

        sessionWork.workPlace = Constants.WORK_PLACE[sessionWork.workPlace - 1];
        sessionWork.startHour = Utils.DATE_UTILS.DateToHourString(
          sessionWork.startHour
        );
        if (sessionWork.endHour) {
          sessionWork.endHour = Utils.DATE_UTILS.DateToHourString(
            sessionWork.endHour
          );
          sessionWork.hourdiff = Utils.DATE_UTILS.hourToString(hourdiff);
        } else {
          sessionWork.endHour = "--";
          sessionWork.hourdiff = "Chưa kết thúc";
          isEndHourNull = true;
        }
      });
      workedHour.workDate = Utils.DATE_UTILS.stringDate1(workedHour.workDate);
      workedHour.workHours1 = sumHourDiff;
      workedHour.workHours1 = Utils.DATE_UTILS.hourToString(
        workedHour.workHours1
      );
      res.render("attendance", {
        pageTitle: "Attendance",
        user: req.user,
        startDate: stringDate,
        workedHour: workedHour,
      });
    }
  });

  // if (req.user.isWork) {
  //   WorkedHour.findOne({ "sessionWorks._id": req.user.currentWorkHour })
  //     .select({
  //       sessionWorks: { $elemMatch: { _id: req.user.currentWorkHour } },
  //     })
  //     .then((workHour) => {
  //       res.render("attendance", {
  //         pageTitle: "Attendance",
  //         user: req.user,
  //         startDate: Utils.DATE_UTILS.DateToHourString(
  //           workHour.sessionWorks[0].startHour
  //         ),
  //       });
  //     })
  //     .catch((err) => console.log(err));
  // } else {
  //   res.render("attendance", {
  //     pageTitle: "Attendance",
  //     user: req.user,
  //     startDate: stringDate,
  //   });
  // }
};

exports.postCheckIn = (req, res, next) => {
  let stringDate = Utils.DATE_UTILS.stringDate1(new Date());

  WorkedHour.getWorkedHourByDate(stringDate, req.user._id)
    .then((resultWorkHours) => {
      console.log(stringDate, resultWorkHours.length);
      if (resultWorkHours.length > 0) {
        return WorkedHour.findOne({ _id: resultWorkHours[0]._id });
      } else {
        return null;
      }
    })
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
        workDate: new Date(stringDate),
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
      workHour.sessionWorks[workHour.sessionWorks.length - 1].endHour =
        Date.now();
      // let hourDiff =
      //   workHour.sessionWorks[0].endHour -
      //   new Date(workHour.sessionWorks[0].startHour);
      // workHour.workHours = workHour.workHours + hourDiff;

      return workHour.save();
    })
    .then((workHour) => {
      req.user.isWork = false;
      req.user.currentWorkHour = null;
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
  return (
    anual
      .save()
      .then((result) => {
        req.user.annualLeave = req.user.annualLeave - countDay;
        return req.user.save();
      })
      // .then((result) => {
      //   return AnualLeave.getWorkedHourByDate(
      //     new Date("2022-07-16"),
      //     req.user._id
      //   );
      // })
      .then((result) => {
        res.redirect("/");
      })
      .catch((err) => console.log(err))
  );
};
