const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const annualLeaveSchema = new Schema({
  typeLeave: {
    type: String,
    required: true,
  },
  dateLeave: [
    {
      type: String,
      required: true,
    },
  ],
  hourLeave: {
    type: Number,
  },
  reason: {
    type: String,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
});

module.exports = mongoose.model("AnnualLeave", annualLeaveSchema);
