const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const sessionHourSchema = new Schema({
  startHour: {
    type: Date,
    required: true,
  },
  endHour: {
    type: Date,
    required: false,
  },
  workPlace: {
    type: Number,
    require: true,
  },
});

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
  isLock: {
    type: Boolean,
    required: false,
  },
  sessionWorks: [
    sessionHourSchema,
    // {
    //   startHour: {
    //     type: Date,
    //     require: true,
    //   },
    //   endHour: {
    //     type: Date,
    //     required: false,
    //   },
    //   workPlace: {
    //     type: Number,
    //     require: true,
    //   },
    // },
  ],
});

//hàm tìm kếm phiên làm việc theo ngày
//tham số:
//stringdate: ngày cần tìm kiếm
//userId: Id cần tìm kiếm
//trả về mảng phiên làm việc
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

//hàm tìm kếm phiên làm việc theo tháng
//tham số:
//month: tháng cần tìm kiếm
//year: năm cần tìm kiếm
//userId: Id cần tìm kiếm
//trả về mảng phiên làm việc
workedHourSchema.statics.getWorkedHourByMonth = function (month, year, userId) {
  userId = new mongoose.mongo.ObjectId(userId);
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

// workedHourSchema.statics.getWorkedHourByMonth = function (month, year, userId) {
//   userId = new mongoose.mongo.ObjectId(userId);
//   return this.aggregate()
//     .addFields({
//       monthOfString: { $dateToString: { format: "%Y-%m", date: "$workDate" } },
//     })
//     .match({ monthOfString: `${year}-${month}`, userId: userId });
//   // return this.aggregate([
//   //   {
//   //     $addFields: {
//   //       monthOfString: {
//   //         $dateToString: { format: "%Y-%m", date: "$workDate" },
//   //       },
//   //     },
//   //   },
//   //   { $match: { monthOfString: `${year}-${month}`, userId: userId } },
//   // ]);
// };

//hàm tìm kếm phiên làm việc theo regex
//tham số:
//regex: regex tìm kiếm
//userId: Id cần tìm kiếm
//trả về mảng phiên làm việc

workedHourSchema.statics.getWorkedByRegex = function (regex, userId) {
  return this.aggregate([
    {
      $addFields: {
        returns: {
          $regexMatch: {
            input: { $dateToString: { format: "%d-%m-%Y", date: "$workDate" } },
            regex: regex,
            options: "i",
          },
        },
      },
    },
    { $match: { returns: true, userId: userId } },
  ]);
};

//Xoá phiên làm việc theo Id của phiên làm việc
//tham số:
//sessionId: Id cần tìm kiếm

workedHourSchema.statics.removeWorkSessionById = function (sessionId) {
  sessionId = new mongoose.mongo.ObjectId(sessionId);
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
