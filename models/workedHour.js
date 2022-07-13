const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const workedHourSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
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
});

const WorkedHour = mongoose.model("workedHour", workedHourSchema);
module.exports = WorkedHour;
