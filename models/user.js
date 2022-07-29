const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  //họ và tên
  fullname: {
    type: String,
    reuqired: true,
  },
  //email
  email: {
    type: String,
    required: true,
  },

  password: {
    type: String,
    required: true,
  },
  //hiện đang làm việc hay không? làm việc: true; không làm việc: false
  isWork: {
    type: Boolean,
    required: true,
  },
  //id hiện tại của phiên làm việc
  currentWorkHour: {
    type: Schema.Types.ObjectId,
    ref: "WorkedHour",
    required: false,
  },
  // ngày sinh
  doB: {
    type: Date,
    required: true,
  },
  // hệ số lương
  salaryScale: {
    type: Number,
    required: true,
  },
  // ngày vào làm
  startDate: {
    type: Date,
    required: true,
  },
  // phòng ban
  department: {
    type: String,
    required: true,
  },
  // số ngày nghỉ phép còn lại
  annualLeave: {
    type: Number,
    required: true,
  },
  // đường dẫn avatar
  imageUrl: {
    type: String,
    required: true,
  },

  isManager: {
    type: Boolean,
    require: true,
  },
  //tình trạng covid hiện tại
  isCovid: {
    type: Schema.Types.ObjectId,
    ref: "covid",
    required: false,
  },
  //thông tin các mũi tiêm
  injectionCovid: [
    {
      index: {
        type: Number,
        required: true,
      },
      typeVacxin: {
        type: Number,
        required: true,
      },
      dateInjection: {
        type: Date,
        required: true,
      },
    },
  ],
});

const User = mongoose.model("user", userSchema);

module.exports = User;
