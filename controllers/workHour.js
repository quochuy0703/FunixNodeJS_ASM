const WorkedHour = require("../models/workedHour");
const AnnualLeave = require("../models/anualLeave");
const Constants = require("../utils/constants");
const Utils = require("../utils/utils");

//GET -> /work-hour
exports.getWorkHours = (req, res, next) => {
  //Tìm kiếm thông tin ngày nghỉ phép theo userID (getLeaveById)
  //sau đó tìm kiếm thông tin giờ làm việc theo userID
  //sau đó nhâp hai thông tin này vào mảng workedHours để hiển thị lên web

  //tìm kiếm thông tin ngày nghỉ phép theo userID
  AnnualLeave.getLeaveById(req.user._id)
    .then((results) => {
      //tìm kiếm thông tin giờ làm việc theo userID
      return WorkedHour.find({ userId: req.user._id })
        .sort({ workDate: -1 })
        .then((workedHours) => {
          workedHours.forEach((workedHour) => {
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
              sessionWork._doc.workPlace =
                Constants.WORK_PLACE[sessionWork.workPlace - 1];
              sessionWork._doc.startHour = Utils.DATE_UTILS.DateToHourString(
                sessionWork.startHour
              );
              //nếu endhour đã kết thúc (khác null )thì:
              if (sessionWork._doc.endHour) {
                //chuyển dữ liệu endHour, hourdiff thành thông tin "xem được" trên trang web
                sessionWork._doc.endHour = Utils.DATE_UTILS.DateToHourString(
                  sessionWork.endHour
                );
                sessionWork.hourdiff = Utils.DATE_UTILS.hourToString(hourdiff);
              } else {
                //chuyển dữ liệu endHour, hourdiff thành thông tin "xem được" trên trang web
                sessionWork._doc.endHour = "--";
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
            pageTitle: "Phiên làm việc",
            path: "/work-hour",
            workedHours: workedHours,
          });
        });
    })

    .catch((err) => console.log(err));
};

//GET -> /work-hour/annual-leaves
exports.getAnnualLeave = (req, res, next) => {
  //tìm kiếm ngày nghỉ phép theo userID
  AnnualLeave.find({ userId: req.user._id })
    .sort({ startDateLeave: 1 })
    .then((annualLeaves) => {
      annualLeaves = annualLeaves.map((annual) => {
        //chuyển các thông tin này thành thông tin hiển thị trên trang web
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

//GET -> /work-hour/salary
exports.getSalary = (req, res, next) => {
  res.render("salary", {
    pageTitle: "Chi tiết tiền lương",
    path: "/work-hour",
    isPost: false,
  });
};

//POST -> /work-hour/salary
exports.postSalary = (req, res, next) => {
  const yearSalary = req.body.yearSalary;
  const monthSalary = req.body.monthSalary;

  AnnualLeave.getLeaveByMonth(monthSalary, yearSalary, req.user._id)
    .then((results) => {
      return WorkedHour.getWorkedHourByMonth(
        monthSalary,
        yearSalary,
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
      // tính tổng số giờ sẽ được lương (overtime - số giờ làm thiếu)
      workedHours.map((workedHour) => {
        sumHour = sumHour + (workedHour.overTime - workedHour.missTime);
      });

      //tính lương
      let salary =
        req.user.salaryScale * 3000000 +
        (sumHour / Constants.ONE_HOUR_TO_MILISECOND) * 200000;

      //format sẽ được hiển thị của tiền Đồng
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

//GET -> /work-hour/search
exports.getSearch = (req, res, next) => {
  res.render("work-hours-search", {
    pageTitle: "Tim kiem",
    path: "/work-hour",
    workedHours: null,
  });
};

//POST -> /work-hour/search
exports.postSearch = (req, res, next) => {
  const searchChoose = req.body.searchChoose;
  const searchText = req.body.searchText;

  if (searchChoose === "1") {
    //tìm kiếm theo kiểm ngày đầy đủ. VD : 20-07-2022
    const regex1 =
      /\b([012]?[0-9]|[3][01])[\/\-.]([01]?\d)[\/\-.](\d{2}|\d{4})\b/g;
    //tìm kiếm theo kiểm theo tháng. VD : m07
    const regex2 = /^m([01]?\d)\b/g;
    //tìm kiếm theo kiểm theo ngày. VD : d07
    const regex3 = /^d([012]?[0-9]|[3][01])\b/g;
    //tìm kiếm theo kiểm theo năm. VD :  y2022
    const regex4 = /^y(\d{4})\b/g;

    let regex = null;
    if (regex1.test(req.body.searchText)) {
      regex = `(req.body.searchText)`;
    }
    if (regex2.test(req.body.searchText)) {
      regex = req.body.searchText;
      regex = `\\d+(-${regex.substring(1)}-)\\d+`;
    }
    if (regex3.test(req.body.searchText)) {
      regex = req.body.searchText;
      regex = `(${regex.substring(1)})(-)\\d+(-)\\d+`;
    }
    if (regex4.test(req.body.searchText)) {
      regex = req.body.searchText;
      regex = `\\b\\d+(-)\\d+(-)(${regex.substring(1)})\\b`;
    }
    if (regex === null) {
      console.log("not regex");
      return res.redirect("/work-hour/search");
    }

    //tìm kiếm theo regex
    WorkedHour.getWorkedByRegex(regex, req.user._id)
      .sort({ workDate: -1 })
      .then((workedHours) => {
        workedHours.forEach((workedHour) => {
          let sumHourDiff = 0;
          let isEndHourNull = false;
          workedHour.sessionWorks.forEach((sessionWork) => {
            const hourdiff = sessionWork.endHour - sessionWork.startHour;
            sumHourDiff = sumHourDiff + hourdiff;

            sessionWork.workPlace =
              Constants.WORK_PLACE[sessionWork.workPlace - 1];
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

        res.render("work-hours-search", {
          pageTitle: "Work Hour",
          path: "/work-hour",
          workedHours: workedHours,
        });
      })
      .catch((err) => console.log(err));
  } else {
    res.redirect("/work-hour/search");
  }
};
