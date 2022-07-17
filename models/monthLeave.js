const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const monthLeaveSchema = new Schema({
  month: [
    {
      date: [
        {
          anualLeaveId: {
            type: Schema.Types.ObjectId,
            ref: "anualLeave",
            required: true,
          },
          countLeave: { type: Number, required: true },
        },
      ],
    },
  ],
});
