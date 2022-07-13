const mongoose = required("mongoose");

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
    required: true,
  },
  workPlace: {
    type: Number,
    require: true,
  },
});
