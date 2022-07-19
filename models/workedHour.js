const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const workedHourSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  // workHours: {
  //   type: Number,
  //   required: true,
  //   default: 0,
  // },
  workDate: {
    type: Date,
    required: true,
  },

  sessionWorks: [
    {
      startHour: {
        type: Date,
        require: true,
      },
      endHour: {
        type: Date,
        required: false,
      },
      workPlace: {
        type: Number,
        require: true,
      },
    },
  ],
});

workedHourSchema.statics.getWorkedHourByDate = function (stringDate, userId) {
  return this.aggregate([
    {
      $addFields: {
        dayOfString: {
          $dateToString: { format: "%Y-%m-%d", date: "$workDate" },
        },
      },
    },
    { $match: { dayOfString: stringDate, userId: userId } },
  ]);
};

workedHourSchema.statics.getWorkedHourByMonth = function (month, year, userId) {
  return this.aggregate([
    {
      $addFields: {
        monthOfString: {
          $dateToString: { format: "%Y-%m", date: "$workDate" },
        },
      },
    },
    { $match: { monthOfString: `${year}-${month}`, userId: userId } },
  ]);
};

const WorkedHour = mongoose.model("workedHour", workedHourSchema);

module.exports = WorkedHour;
