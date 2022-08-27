const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const covidSchema = new Schema({
  dateCovid: {
    type: Date,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
});

module.exports = mongoose.model("Covid", covidSchema);
