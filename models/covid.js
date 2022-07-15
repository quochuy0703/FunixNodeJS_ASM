const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const covidSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  isCovid: {
    type: Boolean,
    required: true,
  },
  dateCovid: {
    type: Date,
    required: true,
    default: new Date(),
  },
});

const Covid = new mongoose.model("covid", covidSchema);
module.exports = Covid;
