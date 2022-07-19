const WorkedHour = require("../models/workedHour");
const AnnualLeave = require("../models/anualLeave");
const Constants = require("../utils/constants");
const Utils = require("../utils/utils");

exports.getWorkHours = (req, res, next) => {
  AnnualLeave.getLeaveById(req.user._id)
    .then((results) => {
      return WorkedHour.find({ userId: req.user._id })
        .sort({ workDate: -1 })
        .then((workedHours) => {
          workedHours.forEach((workedHour) => {
            let sumHourDiff = 0;
            let isEndHourNull = false;
            workedHour.sessionWorks.forEach((sessionWork) => {
              const hourdiff = sessionWork.endHour - sessionWork.startHour;

              sumHourDiff = sumHourDiff + hourdiff;

              sessionWork._doc.workPlace =
                Constants.WORK_PLACE[sessionWork.workPlace - 1];
              sessionWork._doc.startHour = Utils.DATE_UTILS.DateToHourString(
                sessionWork.startHour
              );
              if (sessionWork._doc.endHour) {
                sessionWork._doc.endHour = Utils.DATE_UTILS.DateToHourString(
                  sessionWork.endHour
                );
                sessionWork.hourdiff = Utils.DATE_UTILS.hourToString(hourdiff);
              } else {
                sessionWork._doc.endHour = "--";
                sessionWork.hourdiff = "Chưa kết thúc";
                isEndHourNull = true;
              }
            });

            const dateLeave = results.filter((result) => {
              let stringDate = Utils.DATE_UTILS.stringDate1(result.date);

              let stringDate1 = Utils.DATE_UTILS.stringDate1(
                workedHour.workDate
              );
              return stringDate === stringDate1;
            });

            if (dateLeave.length === 1) {
              workedHour.leave = dateLeave[0].count;
            }

            if (isEndHourNull) {
              workedHour.workHours1 = "--";
              workedHour.overTime = "--";
            } else {
              workedHour.workHours1 = sumHourDiff;
              if (sumHourDiff > Constants.EIGHT_HOUR_TO_MILISECOND) {
                workedHour.overTime =
                  sumHourDiff - Constants.EIGHT_HOUR_TO_MILISECOND;
              } else {
                workedHour.overTime = 0;
              }

              //phan render

              workedHour._doc.workDate = Utils.DATE_UTILS.stringDate1(
                workedHour._doc.workDate
              );
              workedHour.workHours1 = Utils.DATE_UTILS.hourToString(
                workedHour.workHours1
              );
              workedHour.overTime = Utils.DATE_UTILS.hourToString(
                workedHour.overTime
              );
            }
          });

          res.render("work-hours", {
            pageTitle: "Work Hour",
            path: "/work-hour",
            workedHours: workedHours,
          });
        });
    })

    .catch((err) => console.log(err));
};

exports.getAnnualLeave = (req, res, next) => {
  AnnualLeave.find({ userId: req.user._id })
    .sort({ startDateLeave: 1 })
    .then((annualLeaves) => {
      annualLeaves = annualLeaves.map((annual) => {
        annual._doc.startDateLeave = `${
          annual._doc.isMorningStartDate ? "Sáng" : "Chiều"
        } ${annual._doc.startDateLeave.getFullYear()}-${
          annual._doc.startDateLeave.getMonth() + 1
        }-${annual._doc.startDateLeave.getDate()}`;
        annual._doc.endDateLeave = `${
          annual._doc.isMorningEndDate ? "Sáng" : "Chiều"
        } ${annual._doc.endDateLeave.getFullYear()}-${
          annual._doc.endDateLeave.getMonth() + 1
        }-${annual._doc.endDateLeave.getDate()}`;

        return annual;
      });

      res.render("annual-leaves", {
        pageTitle: "Ngày nghỉ",
        path: "/work-hour",
        annualLeaves: annualLeaves,
      });
    })
    .catch((err) => console.log(err));
};

exports.getSalary = (req, res, next) => {
  res.render("salary", {
    pageTitle: "Chi tiết tiền lương",
    path: "/work-hour",
    isPost: false,
  });
};

exports.postSalary = (req, res, next) => {
  console.log(req.body);

  AnnualLeave.getLeaveByMonth(req.body.monthSalary, "2022", req.user._id)
    .then((results) => {
      return WorkedHour.getWorkedHourByMonth(
        req.body.monthSalary,
        "2022",
        req.user._id
      ).then((workedHours) => {
        workedHours.forEach((workedHour) => {
          //tính phần nghỉ phép mỗi ngày
          const dateLeave = results.filter((result) => {
            let stringDate = Utils.DATE_UTILS.stringDate1(result.date);

            let stringDate1 = Utils.DATE_UTILS.stringDate1(workedHour.workDate);

            return stringDate === stringDate1;
          });

          if (dateLeave.length === 1) {
            workedHour.leave = dateLeave[0].count;
          } else {
            workedHour.leave = 0;
          }
          /////////////////////////////////////

          //tính phần tổng giờ đã làm ,overtime, misstime
          let sumHourDiff = 0;
          workedHour.sessionWorks.forEach((sessionWork) => {
            const hourdiff = sessionWork.endHour - sessionWork.startHour;

            sumHourDiff = sumHourDiff + hourdiff;
          });
          workedHour.workHours1 = sumHourDiff;

          if (sumHourDiff > Constants.EIGHT_HOUR_TO_MILISECOND) {
            workedHour.overTime =
              sumHourDiff - Constants.EIGHT_HOUR_TO_MILISECOND;
            workedHour.missTime = 0;
          } else {
            workedHour.overTime = 0;
            if (
              sumHourDiff +
                workedHour.leave * Constants.ONE_HOUR_TO_MILISECOND >
              Constants.EIGHT_HOUR_TO_MILISECOND
            ) {
              workedHour.missTime = 0;
            } else {
              workedHour.missTime =
                Constants.EIGHT_HOUR_TO_MILISECOND -
                (sumHourDiff +
                  workedHour.leave * 8 * Constants.ONE_HOUR_TO_MILISECOND);
            }
          }
          ////////////////////////////////
        });

        return workedHours;
      });
    })
    .then((workedHours) => {
      let sumHour = 0;
      workedHours.map((workedHour) => {
        sumHour = sumHour + (workedHour.overTime - workedHour.missTime);
      });

      console.log(workedHours);

      let salary =
        req.user.salaryScale * 3000000 +
        (sumHour / Constants.ONE_HOUR_TO_MILISECOND) * 200000;
      let dongVN = Intl.NumberFormat("vn-VN", {
        style: "currency",
        currency: "VND",
      });
      res.render("salary", {
        pageTitle: "Chi tiết tiền lương",
        path: "/work-hour",
        isPost: true,
        salaryScale: req.user.salaryScale,
        sumHour: new Intl.NumberFormat("vn-VN", {
          style: "decimal",
          maximumFractionDigits: "2",
        }).format(sumHour / Constants.ONE_HOUR_TO_MILISECOND),
        salary: dongVN.format(salary),
        workedHours: workedHours,
      });
    })
    .catch((err) => console.log(err));
};
