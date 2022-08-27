const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  doB: {
    type: Date,
    required: true,
  },
  salaryScale: {
    type: Number,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  annualLeave: {
    type: Number,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
});

userSchema.methods.countDateAnl = function (date) {
  const updatedAnnualLeave = this.annualLeave - date;
  this.annualLeave = updatedAnnualLeave;
  return this.save();
};

// Link with Check and AnnualLeave model

userSchema.virtual("checks", {
  ref: "Check",
  localField: "_id",
  foreignField: "userId",
});

userSchema.virtual("annualLeaves", {
  ref: "AnnualLeave",
  localField: "_id",
  foreignField: "userId",
});

userSchema.set("toObject", { virtuals: true });
userSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("User", userSchema);
