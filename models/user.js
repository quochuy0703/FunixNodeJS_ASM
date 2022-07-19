const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  fullname: {
    type: String,
    reuqired: true,
  },
  email: {
    type: String,
    required: true,
  },
  isWork: {
    type: Boolean,
    required: true,
  },
  currentWorkHour: {
    type: Schema.Types.ObjectId,
    ref: "WorkedHour",
    required: false,
  },
  doB: {
    type: Date,
    required: true,
  },
  salaryScale: {
    type: Number,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  annualLeave: {
    type: Number,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  isCovid: {
    type: Schema.Types.ObjectId,
    ref: "Covid",
    required: true,
  },
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
