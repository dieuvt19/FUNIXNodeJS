const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const checkSchema = new Schema({
  workPlace: {
    type: String,
    required: true,
  },
  checkin: {
    type: Date,
  },
  checkout: {
    type: Date,
  },
  starting: {
    type: Boolean,
    default: false,
  },
  timeWork: {
    type: Number,
  },
  created: {
    type: String,
  },
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
});

module.exports = mongoose.model("Check", checkSchema);
