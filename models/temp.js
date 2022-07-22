const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const tempSchema = new Schema({
  //user sở hữu thông tin này
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  //nhiệt độ
  temp: {
    type: Number,
    required: true,
  },
  //ngày đo nhiệt độ
  dateTemp: {
    type: Date,
    required: true,
  },
});

const Temp = mongoose.model("temp", tempSchema);

module.exports = Temp;
