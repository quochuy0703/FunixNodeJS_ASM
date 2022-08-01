const User = require("../models/user");
const AnnualLeave = require("../models/anualLeave");
const WorkedHour = require("../models/workedHour");
const Utils = require("../Utils/utils");
const Constants = require("../Utils/constants");

const mongoose = require("mongoose");

// GET => /manage
exports.getManage = (req, res, next) => {
  User.find({ department: req.user.department, isManager: false })
    .then((users) => {
      users.map((user) => {
        user._doc.startDate = Utils.DATE_UTILS.stringDate1(user.startDate);
        user._doc.doB = Utils.DATE_UTILS.stringDate1(user.doB);
        if (user.isWork) {
          user._doc.isWork = "Đang làm việc";
        } else {
          user._doc.isWork = "Không làm việc";
        }
      });

      res.render("manage-staff", {
        pageTitle: "Nhan vien",
        path: "/manage",
        users: users,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// GET => /manage/staff/:id
exports.getManageStaff = (req, res, next) => {
  const userId = req.params.id;

  res.render("manage-work-hours", {
    pageTitle: "Phiên làm việc",
    path: "/work-hour",
    isPost: false,
    staffId: userId,
  });
};

// POST => /manage/staff/:id
exports.postManageStaff = (req, res, next) => {
  const userId = req.params.id;

  const yearSalary = req.body.yearWork;
  const monthSalary = req.body.monthWork;

  AnnualLeave.getLeaveByMonth(monthSalary, yearSalary, userId)
    .then((results) => {
      return (
        WorkedHour.getWorkedHourByMonth(monthSalary, yearSalary, userId)
          // .limit(1)
          .sort({ workDate: -1 })
          .then((workedHours) => {
            workedHours.forEach((workedHour) => {
              if (!workedHour.hasOwnProperty("isLock")) {
                workedHour.isLock = false;
              }

              //sumHourDiff lưu tổng số giờ của các phiên làm việc
              let sumHourDiff = 0;
              //phiên đã kết thúc hay chưa?
              let isEndHourNull = false;
              workedHour.sessionWorks.forEach((sessionWork) => {
                //hourdiff tổng giờ làm việc của phiên làm việc đang tính toán
                const hourdiff = sessionWork.endHour - sessionWork.startHour;
                //cộng tổng vào sumHourDiff ( tổng giờ làm các phiên)
                sumHourDiff = sumHourDiff + hourdiff;

                //chuyển dữ liệu workPlace, startHour thành thông tin "xem được" trên trang web
                sessionWork.workPlace =
                  Constants.WORK_PLACE[sessionWork.workPlace - 1];
                sessionWork.startHour = Utils.DATE_UTILS.DateToHourString(
                  sessionWork.startHour
                );
                //nếu endhour đã kết thúc (khác null )thì:
                if (sessionWork.endHour) {
                  //chuyển dữ liệu endHour, hourdiff thành thông tin "xem được" trên trang web
                  sessionWork.endHour = Utils.DATE_UTILS.DateToHourString(
                    sessionWork.endHour
                  );
                  sessionWork.hourdiff =
                    Utils.DATE_UTILS.hourToString(hourdiff);
                } else {
                  //chuyển dữ liệu endHour, hourdiff thành thông tin "xem được" trên trang web
                  sessionWork.endHour = "--";
                  sessionWork.hourdiff = "Chưa kết thúc";
                  //set isEndHourNull thành true, để biết cho biết rằng phiên này chưa kết thúc
                  isEndHourNull = true;
                }
              });

              //tính toán ngày nghỉ phép cho từng ngày theo phiên làm việc
              //lọc ra thông tin ngày nghỉ phép bằng với thông tin của ngày làm việc đang xét
              const dateLeave = results.filter((result) => {
                let stringDate = Utils.DATE_UTILS.stringDate1(result.date);

                let stringDate1 = Utils.DATE_UTILS.stringDate1(
                  workedHour.workDate
                );
                return stringDate === stringDate1;
              });

              //nếu ngày làm việc này có ngày nghỉ phép thì sẽ lưu ngày nghỉ phép vào leave
              if (dateLeave.length === 1) {
                workedHour.leave = dateLeave[0].count;
              }

              //nếu ngày làm việc này còn có phiên chưa kết thúc thì
              //workHours1, overTime sẽ set là  --
              //ngược lại sẽ tính toán giờ làm thêm và chuyển các thông tin này thành thông tin có thể xem được
              if (isEndHourNull) {
                workedHour.workHours1 = "--";
                workedHour.overTime = "--";
              } else {
                workedHour.workHours1 = sumHourDiff;
                //tín toán giờ làm thêm
                if (sumHourDiff > Constants.EIGHT_HOUR_TO_MILISECOND) {
                  workedHour.overTime =
                    sumHourDiff - Constants.EIGHT_HOUR_TO_MILISECOND;
                } else {
                  workedHour.overTime = 0;
                }

                //phan render

                workedHour.workDate = Utils.DATE_UTILS.stringDate1(
                  workedHour.workDate
                );
                workedHour.workHours1 = Utils.DATE_UTILS.hourToString(
                  workedHour.workHours1
                );
                workedHour.overTime = Utils.DATE_UTILS.hourToString(
                  workedHour.overTime
                );
              }
            });

            res.render("manage-work-hours", {
              pageTitle: "Phiên làm việc",
              path: "/work-hour",
              workedHours: workedHours,
              isPost: true,
              staffId: userId,
            });
          })
      );
    })

    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postManageConfirmStaff = (req, res, next) => {
  const staffId = req.params.id;
  const monthWork = req.body.monthWork;
  const yearWork = req.body.yearWork;
  console.log(monthWork, yearWork);
  WorkedHour.updateMany(
    {
      $expr: {
        $eq: [
          { $dateToString: { format: "%Y-%m", date: "$workDate" } },
          `${yearWork}-${monthWork}`,
        ],
      },
    },
    { $set: { isLock: true } }
  )
    .then((result) => {
      console.log(result);
      res.redirect("/manage");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getManageEditStaff = (req, res, next) => {
  const sessionId = req.params.id;

  WorkedHour.updateOne(
    {
      "sessionWorks._id": new mongoose.mongo.ObjectId(sessionId),
    },
    {
      $pull: { sessionWorks: { _id: new mongoose.mongo.ObjectId(sessionId) } },
    },
    {
      multi: true,
    }
  )
    .then((result) => {
      console.log(result);
      res.redirect("/manage");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
