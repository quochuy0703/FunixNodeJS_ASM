const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const anualLeaveSchema = new Schema({
  //id của user sở hữu ngày nghỉ
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  //ngày bắt đầu nghỉ
  startDateLeave: {
    type: Date,
    required: true,
  },
  //nghỉ từ buổi sáng?
  isMorningStartDate: {
    type: Boolean,
    required: true,
  },
  //ngày vào làm việc
  endDateLeave: {
    type: Date,
    required: true,
  },
  //vào làm việc vào buổi sáng?
  isMorningEndDate: {
    type: Boolean,
    required: true,
  },
  //lý do xin nghỉ phép
  reasonLeave: {
    type: String,
    required: true,
  },
  //số lượng ngày nghỉ
  countDay: {
    type: Number,
    required: true,
  },
});

//hàm để lấy ngày nghỉ phép theo ngày
//các tham số:
//date: ngày cần tìm
//userId: id của người cần tìm
//trả về một mảng chứa các object
//{date: ngày nghỉ phép, leaveId: id của ngày nghỉ phép chứa trong db, count: số giờ nghỉ phép trong ngày nghỉ phép}
anualLeaveSchema.statics.getLeaveByDate = function (date, userId) {
  return this.findOne({
    userId: userId,
    startDateLeave: { $lte: date },
    endDateLeave: { $gte: date },
  }).then((result) => {
    return getDay(date, result);
  });
};

//hàm để lấy số ngày nghỉ phép
//các tham số:
//date: ngày cần tìm số giờ nghỉ phép
//leave:
//trả về số giờ nghỉ phép, 1: là 8h, 0.5 là 4h
const getDay = (date, leave) => {
  // console.log(date, leave.startDateLeave, leave.endDateLeave);
  if (
    date.getTime() !== leave.startDateLeave.getTime() &&
    date.getTime() !== leave.endDateLeave.getTime()
  ) {
    return 1;
  } else if (date.getTime() === leave.startDateLeave.getTime()) {
    if (leave.isMorningStartDate) {
      return 1;
    } else {
      return 0.5;
    }
  } else {
    if (leave.isMorningEndDate) {
      return 0;
    } else {
      return 0.5;
    }
  }
};

// anualLeaveSchema.statics.getLeaveByMonth1 = function (month, year, userId) {
//   return this.aggregate([
//     {
//       $addFields: {
//         monthOfLeave: {
//           $dateToString: { format: "%Y-%m", date: "$startDateLeave" },
//         },
//       },
//     },
//     {
//       $match: { monthOfLeave: `${year}-${month}`, userId: userId },
//     },
//     {
//       $sort: { startDateLeave: 1 },
//     },
//   ]).then((results) => {
//     let monthLeave = [];
//     results.forEach((result) => {
//       for (
//         var d = new Date(result.startDateLeave);
//         d <= result.endDateLeave;
//         d.setDate(d.getDate() + 1)
//       ) {
//         if (d.getMonth() === result.startDateLeave.getMonth()) {
//           let date = {};

//           date.count = getDay(d, result);

//           if (date.count !== 0) {
//             date.date = d.getDate();
//             date.leaveId = result._id;
//             monthLeave.push(date);
//           }
//         }
//       }
//     });

//     return monthLeave;
//   });
// };

//hàm để lấy ngày nghỉ phép theo tháng
//các tham số:
//month: tháng cần tìm
//year: năm cần tìm
//userId: id của người cần tìm
//trả về một mảng chứa các object
//{date: ngày nghỉ phép, leaveId: id của ngày nghỉ phép chứa trong db, count: số giờ nghỉ phép trong ngày nghỉ phép}
anualLeaveSchema.statics.getLeaveByMonth = function (month, year, userId) {
  return this.aggregate([
    {
      $addFields: {
        monthOfLeave: {
          $dateToString: { format: "%Y-%m", date: "$startDateLeave" },
        },
      },
    },
    {
      $match: { monthOfLeave: `${year}-${month}`, userId: userId },
    },
    {
      $sort: { startDateLeave: 1 },
    },
  ]).then((results) => {
    let monthLeave = [];
    results.forEach((result) => {
      for (
        var d = new Date(result.startDateLeave);
        d <= result.endDateLeave;
        d.setDate(d.getDate() + 1)
      ) {
        if (d.getMonth() === result.startDateLeave.getMonth()) {
          let date = {};

          date.count = getDay(d, result);

          if (date.count !== 0) {
            date.date = new Date(d);
            date.leaveId = result._id;
            monthLeave.push(date);
          }
        }
      }
    });

    return monthLeave;
  });
};

//hàm để lấy ngày nghỉ phép theo ID
//các tham số:
//userId: id của người cần tìm
//trả về một mảng chứa các object
//{date: ngày nghỉ phép, leaveId: id của ngày nghỉ phép chứa trong db, count: số giờ nghỉ phép trong ngày nghỉ phép}
anualLeaveSchema.statics.getLeaveById = function (userId) {
  return this.find({ userId: userId })
    .sort({ startDateLeave: 1 })
    .then((results) => {
      const monthLeave = [];
      results.forEach((result) => {
        for (
          var d = new Date(result.startDateLeave);
          d <= result.endDateLeave;
          d.setDate(d.getDate() + 1)
        ) {
          let date = {};

          date.count = getDay(d, result);

          if (date.count !== 0) {
            date.date = new Date(d);
            date.leaveId = result._id;
            monthLeave.push(date);
          }
        }
      });
      return monthLeave;
    });
};

// anualLeaveSchema.statics.getLeaveById1 = function (userId) {
//   return this.find({ userId: userId })
//     .sort({ startDateLeave: 1 })
//     .then((results) => {
//       let currentYear = 0;
//       let currentMonth = 0;
//       const yearLeave = [];
//       results.forEach((result) => {
//         for (
//           var d = new Date(result.startDateLeave);
//           d <= result.endDateLeave;
//           d.setDate(d.getDate() + 1)
//         ) {
//           if (currentYear !== d.getFullYear()) {
//             currentYear = d.getFullYear();

//             yearLeave.push({ year: currentYear, data: [] });
//             // console.log(yearLeave);

//             currentMonth = d.getMonth() + 1;

//             yearLeave[yearLeave.length - 1].data.push({
//               month: currentMonth,
//               data: [],
//             });
//           } else {
//             if (currentMonth !== d.getMonth() + 1) {
//               currentMonth = d.getMonth() + 1;

//               yearLeave[yearLeave.length - 1].data.push({
//                 month: currentMonth,
//                 data: [],
//               });
//             }
//           }

//           if (d.getMonth() + 1 === currentMonth) {
//             let date = {};
//             let dataYear = yearLeave[yearLeave.length - 1].data;
//             let monthLeave = dataYear[dataYear.length - 1].data;

//             date.count = getDay(d, result);

//             if (date.count !== 0) {
//               date.date = d.getDate();
//               date.leaveId = result._id;
//               monthLeave.push(date);
//             }
//           }
//         }
//       });
//       return yearLeave;
//     });
// };

const AnualLeave = mongoose.model("anualLeave", anualLeaveSchema);

module.exports = AnualLeave;
