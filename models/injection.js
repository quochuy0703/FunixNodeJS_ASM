const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const injectionSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
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
});

const Injection = mongoose.model("injection", injectionSchema);

module.exports = Injection;
