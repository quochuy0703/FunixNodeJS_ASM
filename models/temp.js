const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const tempSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  temp: {
    type: Number,
    required: true,
  },
  dateTemp: {
    type: Date,
    required: true,
  },
});

const Temp = mongoose.model("temp", tempSchema);

module.exports = Temp;
