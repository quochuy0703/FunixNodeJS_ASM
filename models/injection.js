const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const injectionSchema = new Schema({
  //user sở hữu thông tin
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  //mũi tiêm thứ mấy
  index: {
    type: Number,
    required: true,
  },
  //loại vacxin
  typeVacxin: {
    type: Number,
    required: true,
  },
  //ngày giờ tiêm
  dateInjection: {
    type: Date,
    required: true,
  },
});

const Injection = mongoose.model("injection", injectionSchema);

module.exports = Injection;
