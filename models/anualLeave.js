const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const anualLeaveSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  startDateLeave: {
    type: Date,
    required: true,
  },
  isMorningStartDate: {
    type: Boolean,
    required: true,
  },
  endDateLeave: {
    type: Date,
    required: true,
  },
  isMorningEndDate: {
    type: Boolean,
    required: true,
  },
  reasonLeave: {
    type: String,
    required: true,
  },
  countDay: {
    type: Number,
    required: true,
  },
});

anualLeaveSchema.statics.getLeaveByDate = function (date, userId) {
  return this.findOne({
    userId: userId,
    startDateLeave: { $lte: date },
    endDateLeave: { $gte: date },
  }).then((result) => {
    if (
      date.getTime() !== result.startDateLeave.getTime() &&
      date.getTime() !== result.endDateLeave.getTime()
    ) {
      return 1;
    } else if (date.getTime() === result.startDateLeave.getTime()) {
      if (result.isMorningStartDate) {
        return 1;
      } else {
        return 0.5;
      }
    } else {
      if (result.isMorningEndDate) {
        return 0;
      } else {
        return 0.5;
      }
    }
  });
};

const getDay = (date, result) => {
  // console.log(date, result.startDateLeave, result.endDateLeave);
  if (
    date.getTime() !== result.startDateLeave.getTime() &&
    date.getTime() !== result.endDateLeave.getTime()
  ) {
    return 1;
  } else if (date.getTime() === result.startDateLeave.getTime()) {
    if (result.isMorningStartDate) {
      return 1;
    } else {
      return 0.5;
    }
  } else {
    if (result.isMorningEndDate) {
      return 0;
    } else {
      return 0.5;
    }
  }
};

anualLeaveSchema.statics.getLeaveByMonth1 = function (month, year, userId) {
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
            date.date = d.getDate();
            date.leaveId = result._id;
            monthLeave.push(date);
          }
        }
      }
    });

    return monthLeave;
  });
};

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

anualLeaveSchema.statics.getLeaveById1 = function (userId) {
  return this.find({ userId: userId })
    .sort({ startDateLeave: 1 })
    .then((results) => {
      let currentYear = 0;
      let currentMonth = 0;
      const yearLeave = [];
      results.forEach((result) => {
        for (
          var d = new Date(result.startDateLeave);
          d <= result.endDateLeave;
          d.setDate(d.getDate() + 1)
        ) {
          if (currentYear !== d.getFullYear()) {
            currentYear = d.getFullYear();

            yearLeave.push({ year: currentYear, data: [] });
            // console.log(yearLeave);

            currentMonth = d.getMonth() + 1;

            yearLeave[yearLeave.length - 1].data.push({
              month: currentMonth,
              data: [],
            });
          } else {
            if (currentMonth !== d.getMonth() + 1) {
              currentMonth = d.getMonth() + 1;

              yearLeave[yearLeave.length - 1].data.push({
                month: currentMonth,
                data: [],
              });
            }
          }

          if (d.getMonth() + 1 === currentMonth) {
            let date = {};
            let dataYear = yearLeave[yearLeave.length - 1].data;
            let monthLeave = dataYear[dataYear.length - 1].data;

            date.count = getDay(d, result);

            if (date.count !== 0) {
              date.date = d.getDate();
              date.leaveId = result._id;
              monthLeave.push(date);
            }
          }
        }
      });
      return yearLeave;
    });
};

const AnualLeave = mongoose.model("anualLeave", anualLeaveSchema);

module.exports = AnualLeave;
