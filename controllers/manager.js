const fs = require("fs");
const path = require("path");

const PDFDocument = require("pdfkit");
const moment = require("moment");

const mongoose = require("mongoose");
const fileHelper = require("../util/file");

const { validationResult } = require("express-validator");

const User = require("../models/user");

exports.getIndex = (req, res, next) => {
  User.findById(req.session.user._id)
    .then((user) => {
      console.log(user.role);
      return res.render("staff/index", {
        pageTitle: "Trang chủ",
        path: "/",
        user: user,
      });
    })
    .catch((err) => console.log(err));
};

// confirm-checks
exports.getConfirmChecks = (req, res, next) => {
  User.findById(req.session.user._id)
    .then((user) => {
      console.log(user.staffs.staffId);
      res.render("manager/confirm-checks", {
        pageTitle: "Thông tin điểm danh",
        path: "/confirm-checks",
        user: user,
      });
    })
    .catch((err) => console.log(err));
};

exports.getConfirmCheck = (req, res, next) => {
  const userId = req.params.staffId;
  console.log(userId);
  User.findById(userId)
    .then((user) => {
      console.log(user);
      res.render("manager/confirm-checks-detail", {
        pageTitle: "Thông tin điểm danh",
        path: "/confirm-checks",
        user: user,
        times: user.timeWorkPerDay,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postConfirmCheck = (req, res, next) => {
  const userId = req.body.userId;
  console.log(userId);

  const confirnCheckId = req.body.confirnCheckId;
  console.log(confirnCheckId);
  User.findById(userId)
    .then((user) => {
      const checkIndex = user.checks.findIndex(
        (check) => check._id.toString() === confirnCheckId.toString()
      );
      console.log(checkIndex);
      user.checks[checkIndex].confirm = true;
      user.save();
      const path = "/confirm-checks/" + userId;
      console.log(path);
      res.redirect(path);
    })
    .catch((err) => console.log(err));
};

exports.postDeleteCheck = (req, res, next) => {
  const userId = req.body.userId;
  console.log(userId);

  const checkDeleteId = req.body.checkDeleteId;

  User.findById(userId)
    .then((user) => {
      const checkIndex = user.checks.findIndex((item) => {
        return Object(item._id).valueOf() === checkDeleteId;
      });
      console.log(checkIndex);

      // update timeWork
      const timeWorkDel = user.checks[checkIndex].timeWork;
      console.log(timeWorkDel);
      const dateDel = user.checks[checkIndex].date;
      console.log(dateDel);

      const dateIndex = user.timeWorkPerDay.findIndex((item) => {
        return item.date.toString() === dateDel.toString();
      });
      if (dateIndex >= 0) {
        const timeDay = user.timeWorkPerDay[dateIndex];
        timeDay.workHours = (timeDay.workHours - timeWorkDel).toFixed(2);
        timeDay.overTime =
          timeDay.workHours + timeDay.leaveHours - 8 > 0
            ? (timeDay.workHours + timeDay.leaveHours - 8).toFixed(2)
            : 0;
        timeDay.missingTime =
          8 - timeDay.workHours - timeDay.leaveHours > 0
            ? (8 - timeDay.workHours - timeDay.leaveHours).toFixed(2)
            : 0;
      }
      user.checks.splice(checkIndex, 1);
      user.save();
      const path = "/confirm-checks/" + userId;
      res.redirect(path);
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postConfirmMonth = (req, res, next) => {
  const userId = req.body.userId;
  console.log(userId);

  const month = req.body.month;
  console.log(month);
  User.findById(userId)
    .then((user) => {
      console.log(user);
      const checks = user.checks.filter(
        (check) => check.monthOfYear.toString() === month.toString()
      );
      const leaves = user.leaves.filter(
        (leave) => leave.monthOfYear.toString() === month.toString()
      );
      const times = user.timeWorkPerDay.filter(
        (time) => time.monthOfYear.toString() === month.toString()
      );
      res.render("manager/confirm-month", {
        pageTitle: "Thông tin điểm danh",
        path: "/confirm-month",
        user: user,
        month: month,
        checks: checks,
        leaves: leaves,
        times: times,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// Covid
exports.getManaCovid = (req, res, next) => {
  User.findById(req.session.user._id)
    .then((user) => {
      console.log(user.staffs);
      res.render("manager/manaCovid", {
        pageTitle: "Quản lý thông tin Covid",
        path: "/manaCovid",
        user: user,
      });
    })
    .catch((err) => console.log(err));
};

exports.postStaffCovid = (req, res, next) => {
  const userId = req.body.staffId;
  console.log(userId);
  User.findById(userId)
    .then((user) => {
      console.log(user);
      res.render("manager/staff-covid", {
        pageTitle: "Thông tin covid",
        path: "/staff-covid",
        user: user,
        temps: user.bodyTemps,
        vacs: user.vaccines,
        covids: user.covids,
      });
    })
    .catch((err) => console.log(err));
};

exports.getCoviPDF = (req, res, next) => {
  const userId = req.params.staffId;
  console.log(userId);
  User.findById(userId)
    .then((user) => {
      const pdfName = "covid-" + userId + ".pdf";
      const covidPDFPath = path.join("data", "covidPDF", pdfName);

      const pdfDoc = new PDFDocument();
      pdfDoc.registerFont("Roboto", "assets/Roboto/Roboto-Medium.ttf");

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        'inline; filename="' + pdfName + '"'
      );

      pdfDoc.pipe(fs.createWriteStream(covidPDFPath));
      pdfDoc.pipe(res);

      pdfDoc
        .fontSize(24)
        .font("Roboto")
        .text("THÔNG TIN COVID " + user.name.toUpperCase());
      pdfDoc.text("----------------------");
      pdfDoc.fontSize(20).font("Roboto").text("Thông tin thân nhiệt:");
      if (user.bodyTemps.length > 0) {
        user.bodyTemps.forEach((temp) => {
          pdfDoc
            .fontSize(14)
            .font("Roboto")
            .text(
              "Ngày giờ đăng ký: " +
                moment(temp.timeBodyTemp).format("DD/MM/YYYY HH:mm") +
                " phút, " +
                "nhiệt độ cơ thể: " +
                temp.bodyTemp +
                "°C"
            );
        });
      } else {
        pdfDoc
          .fontSize(14)
          .font("Roboto")
          .text("Chưa đăng ký thông tin thân nhiệt");
      }

      pdfDoc.fontSize(20).font("Roboto").text("Thông tin tiêm vaccine:");
      if (user.vaccines.length > 0) {
        user.vaccines.forEach((vac) => {
          pdfDoc
            .fontSize(14)
            .font("Roboto")
            .text(
              "Lần tiêm: " +
                vac.type +
                ", tên vaccine: " +
                vac.name +
                ", ngày tiêm: " +
                moment(vac.date).format("DD/MM/YYYY")
            );
        });
      } else {
        pdfDoc
          .fontSize(14)
          .font("Roboto")
          .text("Chưa đăng ký thông tin tiêm vaccine");
      }

      pdfDoc.fontSize(20).font("Roboto").text("Thông tin dương tính Covid:");
      if (user.covids.length > 0) {
        user.covids.forEach((covid) => {
          pdfDoc
            .fontSize(14)
            .font("Roboto")
            .text(
              "Ngày phát hiện dương tính: " +
                moment(covid.dateCovid).format("DD/MM/YYYY")
            );
        });
      } else {
        pdfDoc.fontSize(14).font("Roboto").text("Chưa phát hiện dương tính");
      }

      pdfDoc.end();
    })
    .catch((err) => console.log(err));
};
