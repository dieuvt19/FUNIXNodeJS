const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
  },
  password: {
    type: String,
  },
  name: {
    type: String,
  },
  doB: {
    type: Date,
  },
  salaryScale: {
    type: Number,
  },
  startDate: {
    type: Date,
  },
  department: {
    type: String,
  },
  annualLeave: {
    type: Number,
  },
  image: {
    type: String,
  },
  checks: [
    {
      checkin: { type: Date },
      checkout: { type: Date },
      workPlace: { type: String },
      date: { type: String },
      timeWork: { type: Number },
      starting: { type: Boolean },
      monthOfYear: { type: String },
    },
  ],
  timeWorkPerDay: [
    {
      date: { type: String },
      monthOfYear: { type: String },
      workHours: { type: Number, default: 0 },
      leaveHours: { type: Number, default: 0 },
      overTime: { type: Number, default: 0 },
      missingTime: { type: Number, default: 0 },
    },
  ],
  starting: { type: Boolean },
  leaves: [
    {
      dateLeave: { type: String },
      hourLeave: { type: Number, default: 0 },
      reason: { type: String, required: true },
      typeLeave: { type: String },
      monthOfYear: { type: String },
    },
  ],
  bodyTemps: [
    {
      bodyTemp: { type: Number },
      timeBodyTemp: { type: Date },
    },
  ],
  vaccines: [
    {
      name: { type: String },
      type: { type: String },
      date: { type: Date },
    },
  ],
  covids: [
    {
      dateCovid: { type: Date },
    },
  ],
  role: { type: String },
  managerId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  staffs: [
    {
      staffId: { type: Schema.Types.ObjectId, ref: "User" },
      name: { type: String },
    },
  ],
});

userSchema.methods.countDateAnl = function (date) {
  const updatedAnnualLeave = this.annualLeave - date;
  this.annualLeave = updatedAnnualLeave;
  return this.save();
};

userSchema.methods.deleteCheck = function (checkId) {
  const checkIdIndex = this.checks.findIndex((item) => {
    item._id.toString() === checkId.toString();
  });
  this.checks.splice(checkIdIndex, 1);
  return this.save();
};

module.exports = mongoose.model("User", userSchema);
