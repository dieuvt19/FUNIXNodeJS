const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const tempSchema = new Schema({
  bodyTemp: {
    type: Number,
    required: true,
  },
  timeBodyTemp: {
    type: Date,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
});

module.exports = mongoose.model("Temp", tempSchema);
