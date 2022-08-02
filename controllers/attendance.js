const WorkedHour = require("../models/workedHour");
const AnualLeave = require("../models/anualLeave");
const Utils = require("../utils/utils");
const Constants = require("../utils/constants");

//GET -> /
exports.getAttendance = (req, res, next) => {
  //stringDate thông tin giờ bắt đầu làm việc
  let stringDate = null;

  //lấy thông tin phiên làm việc của ngày hiện tại
  WorkedHour.getWorkedHourByDate(
    Utils.DATE_UTILS.stringDate1(new Date()),
    req.user._id
  ).then((workedHours) => {
    //nếu như chưa có thông tin phiên làm việc ngày hiện tại thì trả về trang với thông tin workedHour là null
    //nếu có thì tính toán các thông số như tổng giờ làm của phiên, tổng số giờ làm của các phiên trong ngày.
    if (workedHours.length <= 0) {
      return res.render("attendance", {
        pageTitle: "Điểm Danh",
        path: "/",
        user: req.user,
        startDate: stringDate,
        workedHour: null,
      });
    }
    const workedHour = workedHours[0];
    //nếu đang làm việc thì trả về thông tin của giờ bắt đầu làm việc, lúc này chưa trang chưa hiển thị
    //thông tin phiên làm việc
    //nếu kết thúc phiên làm việc thì tính toán thông số như tổng giờ làm của phiên, tổng số giờ làm của các phiên trong ngày
    if (req.user.isWork) {
      res.render("attendance", {
        pageTitle: "Kết thúc làm việc",
        path: "/",
        user: req.user,
        startDate: Utils.DATE_UTILS.DateToHourString(
          workedHour.sessionWorks[workedHour.sessionWorks.length - 1].startHour
        ),
        workedHour: workedHour,
      });
    } else {
      //sumHourDiff sẽ chứa tổng số giờ làm việc theo ngày
      let sumHourDiff = 0;

      workedHour.sessionWorks.forEach((sessionWork) => {
        //hourdiff tổng số giờ làm việc theo phiên
        const hourdiff = sessionWork.endHour - sessionWork.startHour;
        // cộng dồn từng phiên vào sumHourDiff
        sumHourDiff = sumHourDiff + hourdiff;

        //chuyển thông số workPlace thành thông tin có thể hiển thị được trên web
        //ví dụ 1: Công ty....
        sessionWork.workPlace = Constants.WORK_PLACE[sessionWork.workPlace - 1];
        //Chuyển thông tin bắt đầu phiên làm việc thành thông tin có thể đọc được trên web
        sessionWork.startHour = Utils.DATE_UTILS.DateToHourString(
          sessionWork.startHour
        );
        //nếu endHour là null thì hiển thị endHour, tổng số thời theo phiên là Chưa kết thúc
        //nếu không thì chuyển về thông tin có thể đọc được trên web
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
      //chuyển các thông tin thành thông tin có thể đọc được trên web
      workedHour.workDate = Utils.DATE_UTILS.stringDate1(workedHour.workDate);
      workedHour.workHours1 = sumHourDiff;
      workedHour.workHours1 = Utils.DATE_UTILS.hourToString(
        workedHour.workHours1
      );
      res.render("attendance", {
        pageTitle: "Điểm danh",
        path: "/",
        user: req.user,
        startDate: stringDate,
        workedHour: workedHour,
      });
    }
  });
};

//POST -> /checkin
exports.postCheckIn = (req, res, next) => {
  //chuyển thông tin ngày hiện tại thành dạng yyyy-mm-dd để có thể so sánh được trong mongodb
  let stringDate = Utils.DATE_UTILS.stringDate1(new Date());
  // lấy thông tin các phiên làm việc theo ngày
  WorkedHour.getWorkedHourByDate(stringDate, req.user._id)
    .then((resultWorkHours) => {
      //nếu có phiên làm việc thì sẽ trả về, còn không trả về null

      if (resultWorkHours.length > 0) {
        return WorkedHour.findOne({ _id: resultWorkHours[0]._id });
      } else {
        return null;
      }
    })
    .then((resultWorkHour) => {
      //nếu có thông tin phiên làm việc của ngày hôm đó thì sẽ thêm phiên làm việc đó vào mảng sessionWorks
      //còn không thì tạo workedHour mới(phiên làm việc đầu tiên trong ngày)
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
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

//POST -> /checkout
exports.postCheckOut = (req, res, next) => {
  //tìm thông tin workhour được lưu trong user.currentWorkHour
  WorkedHour.findOne({ "sessionWorks._id": req.user.currentWorkHour })
    .select("workHours")
    .select({
      sessionWorks: { $elemMatch: { _id: req.user.currentWorkHour } },
    })
    .then((workHour) => {
      //nếu có workhour này thì đặt ngày giờ hiện tại cho endHour
      workHour.sessionWorks[workHour.sessionWorks.length - 1].endHour =
        Date.now();
      // let hourDiff =
      //   workHour.sessionWorks[0].endHour -
      //   new Date(workHour.sessionWorks[0].startHour);
      // workHour.workHours = workHour.workHours + hourDiff;

      //lưu thông tin ngày vào mongodb
      return workHour.save();
    })
    .then((workHour) => {
      //chuyển các thông tin isWork thành false, và set currentWorkHour thành null
      //sau đó lưu thông tin này vào mongodb
      req.user.isWork = false;
      req.user.currentWorkHour = null;
      return req.user.save();
    })
    .then((result) => {
      res.redirect("/");
    })

    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

//GET -> /leave
//lấy trang thông tin nghỉ phép
exports.getLeave = (req, res, next) => {
  res.render("leave", { pageTitle: "Nghỉ phép", path: "/", user: req.user });
};

//POST -> /leave
exports.postLeave = (req, res, next) => {
  const startLeaveDate = req.body.startLeaveDate;
  const anteLeaveStart = req.body.anteLeaveStart === "1" ? true : false;
  const endLeaveDate = req.body.endLeaveDate;
  const anteLeaveEnd = req.body.anteLeaveEnd === "1" ? true : false;
  const reasonLeave = req.body.reasonLeave;

  //tín toán số ngày nghỉ phép và lưu vào countDay
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

  //nếu ngày còn lại được nghỉ của user nhỏ hơn thì sẽ chuyển về trang leave
  //còn không thì tạo mới thông tin ngày nghỉ phép
  if (req.user.anualLeave < countDay) {
    return res.redirect("/leave");
  }

  // tạo mới thông tin ngày nghỉ phép
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
        //trừ số ngày nghỉ phép còn lại và lưu thông tin lên mongodb
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
      .catch((err) => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      })
  );
};
