const WorkedHour = require("../models/workedHour");
const AnnualLeave = require("../models/anualLeave");
const Constants = require("../utils/constants");
const Utils = require("../utils/utils");

exports.getWorkHours = (req, res, next) => {
  AnnualLeave.getLeaveById(req.user._id)
    .then((results) => {
      return WorkedHour.find({ userId: req.user._id }).then((workedHours) => {
        workedHours.forEach((workedHour) => {
          let sumHourDiff = 0;
          workedHour.sessionWorks.forEach((sessionWork) => {
            const hourdiff = sessionWork.endHour - sessionWork.startHour;

            sumHourDiff = sumHourDiff + hourdiff;
          });
          workedHour.workHours1 = sumHourDiff;

          if (sumHourDiff > Constants.EIGHT_HOUR_TO_MILISECOND) {
            workedHour.overTime =
              sumHourDiff - Constants.EIGHT_HOUR_TO_MILISECOND;
          } else {
            workedHour.overTime = 0;
          }

          const dateLeave = results.filter((result) => {
            let stringDate = Utils.DATE_UTILS.stringDate1(result.date);

            let stringDate1 = Utils.DATE_UTILS.stringDate1(workedHour.workDate);
            return stringDate === stringDate1;
          });

          if (dateLeave.length === 1) {
            workedHour.leave = dateLeave[0].count;
          }

          //phan render

          workedHour._doc.workDate = Utils.DATE_UTILS.stringDate1(
            workedHour._doc.workDate
          );
        });

        res.render("work-hours", {
          pageTitle: "Work Hour",
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
      res.render("annual-leaves", {
        pageTitle: "Ngày nghỉ",
        annualLeaves: annualLeaves,
      });
    })
    .catch((err) => console.log(err));
};

exports.getSalary = (req, res, next) => {
  res.render("salary", {
    pageTitle: "Chi tiết tiền lương",
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
                sumHourDiff +
                workedHour.leave * Constants.ONE_HOUR_TO_MILISECOND;
            }
          }
          ////////////////////////////////
        });

        return workedHours;
      });
    })
    .then((workedHours) => {
      console.log(workedHours);
      let sumHour = 0;
      workedHours.map((workedHour) => {
        sumHour = sumHour + (workedHour.overTime - workedHour.missTime);
      });

      let salary =
        req.user.salaryScale * 3000000 +
        (sumHour / Constants.ONE_HOUR_TO_MILISECOND) * 200000;
      let dongVN = Intl.NumberFormat("vn-VN", {
        style: "currency",
        currency: "VND",
      });
      res.render("salary", {
        pageTitle: "Chi tiết tiền lương",
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
