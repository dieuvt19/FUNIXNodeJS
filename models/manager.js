const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const managerSchema = new Schema({
  username: { type: String },
  password: { type: String },
  name: { type: String },
  staffs: [{ userId: { type: Schema.Types.ObjectId, ref: "User" } }],
});

module.exports = mongoose.model("Manager", managerSchema);
