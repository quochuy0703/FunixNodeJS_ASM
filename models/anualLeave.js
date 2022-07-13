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

const AnualLeave = mongoose.model("anualLeave", anualLeaveSchema);

module.exports = AnualLeave;
