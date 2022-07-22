const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const covidSchema = new Schema({
  //user sổ hữu thông tin này
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  //dương tính: true, âm tính; false
  isCovid: {
    type: Boolean,
    required: true,
  },
  //ngày khai báo thông tin
  dateCovid: {
    type: Date,
    required: true,
    default: new Date(),
  },
});

const Covid = new mongoose.model("covid", covidSchema);
module.exports = Covid;
