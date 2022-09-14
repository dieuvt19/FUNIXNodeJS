const User = require("../models/user");
const fileHelper = require("../util/file");

const { validationResult } = require("express-validator");
const { response } = require("express");

const moment = require("moment");

const { JSDOM } = require( "jsdom" );
const { window } = new JSDOM( "" );
const $ = require( "jquery" )( window );

 $(document).ready(function () {
   $("#dateLeave").multiDatesPicker({ dateFormat: "yy-mm-dd" });
 });

exports.getIndex = (req, res, next) => {
  User.findById(req.session.user._id)
    .then((user) => {
      console.log(user);
      return res.render("staff/index", {
        pageTitle: "Trang chủ",
        path: "/",
        user: user,
      });
    })
    .catch((err) => console.log(err));
};

// Screen 1: Roll-call

exports.getRollCall = (req, res, next) => {
  User.findById(req.session.user._id)
    .then((user) => {
      console.log(user);
      return res.render("staff/roll-call", {
        pageTitle: "Điểm danh",
        path: "/roll-call",
        user: user,
      });
    })
    .catch((err) => console.log(err));
};

exports.getCheckIn = (req, res, next) => {
  User.findById(req.session.user._id)
    .then((user) => {
      if (user.starting) {
        res.render("staff/check-in", {
          pageTitle: "Check in",
          path: "/check-in",
          user: user,
          starting: true,
          alert: "",
        });
      } else {
        res.render("staff/check-in", {
          pageTitle: "Check in",
          path: "/check-in",
          user: user,
          starting: false,
        });
      }
    })
    .catch((err) => console.log(err));
};

exports.postCheckIn = (req, res, next) => {
  const workPlace = req.body.workPlace;
  let checkin = new Date();
  const date = moment(checkin).format("YYYY-MM-DD");
  const monthOfYear = moment(checkin).format("YYYY-MM");
  const check = {
    workPlace: workPlace,
    checkin: checkin,
    date: date,
    starting: true,
    monthOfYear: monthOfYear,
  };
  console.log(check);

  const timeWorkPerDay = {
    date: date,
    monthOfYear: monthOfYear,
  };
  User.findById(req.session.user._id)
    .then((user) => {
      console.log(user);
      user.checks.push(check);

      const dateCheck = user.timeWorkPerDay.filter(
        (time) => time.date === date
      );
      console.log(dateCheck);
      if (dateCheck.length <= 0) {
        user.timeWorkPerDay.push(timeWorkPerDay);
      }
      user.starting = true;
      user.save();

      return res.render("staff/check-in", {
        pageTitle: "Check in",
        path: "/check-in",
        user: user,
        starting: true,
        alert: "Bạn đã điểm danh thành công!",
      });
    })
    .catch((err) => console.log(err));
};

exports.getCheckOut = (req, res, next) => {
  User.findById(req.session.user._id)
    .then((user) => {
      console.log(user);
      const checks = user.checks.filter((check) => check.starting === true);
      console.log(checks);

      return res.render("staff/check-out", {
        pageTitle: "Check out",
        path: "/check-out",
        checks: checks,
      });
    })
    .catch((err) => console.log(err));
};

exports.postCheckOut = (req, res, next) => {
  const checkId = req.body.checkId;
  console.log(checkId);
  const checkout = new Date();
  User.findById(req.session.user._id)
    .then((user) => {
      console.log(user);
      const check = user.checks.filter((check) => check.starting === true)[0];
      check.checkout = checkout;
      check.starting = false;
      check.timeWork = (
        moment(checkout).diff(moment(check.checkin), "minutes") / 60
      ).toFixed(2);
      console.log(check.timeWork);

      const dateIndex = user.timeWorkPerDay.findIndex((time) => {
        return time.date === check.date;
      });
      if (dateIndex >= 0) {
        const timeDay = user.timeWorkPerDay[dateIndex];
        timeDay.workHours += check.timeWork;
        timeDay.overTime =
          timeDay.workHours + timeDay.leaveHours - 8 > 0
            ? (timeDay.workHours + timeDay.leaveHours - 8).toFixed(2)
            : 0;
        timeDay.missingTime =
          8 - timeDay.workHours - timeDay.leaveHours > 0
            ? (8 - timeDay.workHours - timeDay.leaveHours).toFixed(2)
            : 0;
      }
      user.starting = false;
      user.save();
      res.redirect("/check-details");
    })
    .catch((err) => console.log(err));
};

exports.getCheckDetails = (req, res, next) => {
  let today = moment(new Date()).format("YYYY-MM-DD");
  User.findById(req.session.user._id)
    .then((user) => {
      // console.log(user);
      const checks = user.checks.filter((check) => check.date === today);
      console.log(checks);
      const isCheckout = checks.filter((check) => check.starting === true);
      console.log(isCheckout);
      // total working time
      let total = 0;
      checks.forEach((check) => {
        total += check.timeWork;
        console.log(total);
        return total;
      });

      res.render("staff/check-details", {
        pageTitle: "Chi tiết điểm danh",
        path: "/check-details",
        checks: checks,
        total: total,
        isCheckout: isCheckout,
      });
    })
    .catch((err) => console.log(err));
};

// AnnualLeave
exports.getAnnualLeave = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  User.findById(req.session.user._id).then((user) => {
    console.log(user);
    res.render("staff/annualLeave", {
      user: user,
      pageTitle: "Đăng ký nghỉ phép",
      path: "/annualLeave",
      errorMessage: message,
    });
  });
};

exports.postAnnualLeave = (req, res, next) => {
  const typeLeave = req.body.typeLeave;
  let dateLeaveInp = req.body.dateLeave;
  const hourLeave = req.body.hourLeave;
  const reason = req.body.reason;

  console.log(dateLeaveInp);
  const dateLeaveArr = dateLeaveInp.split(", ");
  console.log(dateLeaveArr);

  User.findById(req.session.user._id).then((user) => {
    if (dateLeaveArr.length > user.annualLeave) {
      req.flash("error", "Số ngày nghỉ còn lại không đủ!");
      return res.redirect("/annualLeave");
    }
    for (let i = 0; i < dateLeaveArr.length; i++) {
      const leaveInp = {
        typeLeave: typeLeave,
        dateLeave: dateLeaveArr[i],
        reason: reason,
        monthOfYear: moment(dateLeaveArr[i]).format("YYYY-MM"),
        hourLeave: typeLeave === "Theo ngày" ? 8 : hourLeave,
      };
      user.leaves.push(leaveInp);

      const dateIndex = user.timeWorkPerDay.findIndex(
        (time) => time.date.toString() === dateLeaveArr[i].toString()
      );
      console.log(dateIndex);
      if (dateIndex >= 0) {
        const timeDay = user.timeWorkPerDay[dateIndex];
        console.log(timeDay);
        timeDay.leaveHours = typeLeave === "Theo ngày" ? 8 : hourLeave;
        timeDay.overTime =
          timeDay.workHours + timeDay.leaveHours - 8 > 0
            ? (timeDay.workHours + timeDay.leaveHours - 8).toFixed(2)
            : 0;
        timeDay.missingTime =
          8 - timeDay.workHours - timeDay.leaveHours > 0
            ? (8 - timeDay.workHours - timeDay.leaveHours).toFixed(2)
            : 0;
      } else {
        const newtimeWorkPD = {
          date: dateLeaveArr[i],
          monthOfYear: moment(dateLeaveArr[i]).format("YYYY-MM"),
          leaveHours: typeLeave === "Theo ngày" ? 8 : hourLeave,
        };
        user.timeWorkPerDay.push(newtimeWorkPD);
      }
    }
    user
      .save()
      .then((user) => {
        console.log(user);
        if (typeLeave === "Theo ngày") {
          return user.countDateAnl(dateLeaveArr.length);
        } else {
          return user.countDateAnl(hourLeave / 8);
        }
      })
      .then((result) => {
        console.log("Created annualLeave");
        res.redirect("/annualLeave");
      })
      .catch((err) => console.log(err));
  });
};

// Screen 2: information staff

exports.getInfoStaff = (req, res, next) => {
  User.findById(req.session.user._id)
    .then((user) => {
      console.log(user);
      res.render("staff/infoStaff", {
        user: user,
        pageTitle: "Xem/Sửa thông tin cá nhân",
        path: "/infoStaff",
      });
    })
    .catch((err) => console.log(err));
};

exports.getEditInfoStaff = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  const userId = req.params.staffId;
  console.log(userId);
  User.findById(userId)
    .then((user) => {
      console.log(user);
      res.render("staff/edit-infoStaff", {
        pageTitle: "Xem/Sửa thông tin cá nhân",
        path: "/edit-infoStaff",
        user: user,
        errorMessage: null,
        hasError: false,
        validationErrors: [],
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postEditInfoStaff = (req, res, next) => {
  const userId = req.body.userId;
  const updatedImage = req.file;
  console.log(updatedImage);

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("staff/edit-infoStaff", {
      pageTitle: "Xem/Sửa thông tin cá nhân",
      path: "/edit-infoStaff",
      hasError: true,
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }

  User.findById(userId)
    .then((user) => {
      console.log(user);
      if (user.id.toString() !== req.user._id.toString()) {
        return res.redirect("/edit-infoStaff");
      }
      if (!updatedImage) {
        return res.status(422).render("staff/edit-infoStaff", {
          pageTitle: "Xem/Sửa thông tin cá nhân",
          path: "/edit-infoStaff",
          hasError: true,
          user: user,
          errorMessage: "Attached file is not an image.",
          validationErrors: [],
        });
      }
      if (updatedImage) {
        fileHelper.deleteFile(user.image);
        user.image = updatedImage.path;
      }
      return user.save().then((result) => {
        console.log("UPDATED INFOMATION USER");
        res.redirect("/infoStaff");
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// Screen 3: Search

exports.getSearch = (req, res, next) => {
  const numRows = req.body.numRows;
  console.log(numRows);
  const page = +req.query.page || 1;
  let totalItems;
  let itemsPerPage = 5;
  if (numRows) {
    itemsPerPage = parseInt(numRows);
  }

  User.findById(req.session.user._id)
    .populate("managerId", "name")
    .then((user) => {
      console.log(user);
      totalItems = user.checks.length;
      let start = (page - 1) * itemsPerPage;
      let end = (page - 1) * itemsPerPage + itemsPerPage;
      let checkPag = user.checks.slice(start, end);
      console.log(user.timeWorkPerDay);
      res.render("staff/search", {
        pageTitle: "Tra cứu",
        path: "/search",
        user: user,
        checkPag: checkPag,
        times: user.timeWorkPerDay,
        currentPage: page,
        hasNextPage: itemsPerPage * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / itemsPerPage),
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postSearch = (req, res, next) => {
  const numRows = req.body.numRows;
  console.log(numRows);
  const page = +req.query.page || 1;
  let totalItems;
  let itemsPerPage = parseInt(numRows);
  console.log(itemsPerPage);

  User.findById(req.session.user._id)
    .then((user) => {
      totalItems = user.checks.length;
      // const skip = (page - 1) * ITEMS_PER_PAGE;
      let start = (page - 1) * itemsPerPage;
      let end = (page - 1) * itemsPerPage + itemsPerPage;
      let checkPag = user.checks.slice(start, end);
      console.log(user.timeWorkPerDay);
      res.render("staff/search", {
        pageTitle: "Tra cứu",
        path: "/search",
        user: user,
        checkPag: checkPag,
        times: user.timeWorkPerDay,
        currentPage: page,
        hasNextPage: itemsPerPage * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / itemsPerPage),
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// Search salary
exports.postSearchSalary = (req, res, next) => {
  const monthSearch = req.body.salaryMonth;
  console.log(monthSearch);
  User.findById(req.session.user._id)
    .then((user) => {
      console.log(user);
      const dayWorkPerMonth = user.timeWorkPerDay.filter(
        (day) => day.monthOfYear.toString() === monthSearch.toString()
      );
      console.log(dayWorkPerMonth);

      if (dayWorkPerMonth.length > 0) {
        // total working time
        let totalOverTime = 0;
        let totalMissingTime = 0;

        dayWorkPerMonth.forEach((day) => {
          totalOverTime += day.overTime;
          totalMissingTime += day.missingTime;
        });
        console.log(totalOverTime);
        console.log(totalMissingTime);
        const salary =
          user.salaryScale * 3000000 +
          (totalOverTime - totalMissingTime) * 200000;

        res.render("staff/search-salary", {
          pageTitle: "Tra cứu lương theo tháng",
          path: "/search-date",
          user: user,
          totalOverTime: totalOverTime,
          totalMissingTime: totalMissingTime,
          salary: salary,
          monthSearch: monthSearch,
        });
      } else {
        res.render("staff/search-salary", {
          pageTitle: "Tra cứu lương theo tháng",
          path: "/search-date",
          user: user,
          totalOverTime: 0,
          totalMissingTime: 0,
          salary: 0,
          monthSearch: monthSearch,
        });
      }
    })
    .catch((err) => console.log(err));
};

exports.postSearchDate = (req, res, next) => {
  const searchDate = req.body.searchDate;
  console.log(searchDate);
  User.findById(req.session.user._id)
    .then((user) => {
      console.log(user);
      const checkArr = user.checks.filter(
        (check) => check.date.toString() === searchDate.toString()
      );
      console.log(checkArr);

      if (checkArr.length > 0) {
        const isCheckout = checkArr.filter((check) => check.starting === true);
        console.log(isCheckout);

        let total = 0;
        checkArr.forEach((check) => {
          total += check.timeWork;
          console.log(total);
          return total;
        });

        res.render("staff/search-date", {
          pageTitle: "Tra cứu điểm danh theo ngày",
          path: "/search-date",
          checks: checkArr,
          total: total,
          searchDate: searchDate,
          isCheckout: isCheckout,
        });
      } else {
        res.render("staff/search-date", {
          pageTitle: "Tra cứu điểm danh theo ngày",
          path: "/search-date",
          checks: [],
          total: "",
          searchDate: searchDate,
        });
      }
    })
    .catch((err) => console.log(err));
};

// Screen 4: Covid
exports.getInfoCovid = (req, res, next) => {
  res.render("staff/covid", {
    pageTitle: "Thông tin Covid",
    path: "/covid",
    confirmTemp: "",
    confirmVaccine: "",
    confirmCovid: "",
  });
};

// bodyTemp
exports.postTemp = (req, res, next) => {
  const bodyTemp = req.body.bodyTemp;
  const timeBodyTemp = new Date();
  const temp = {
    bodyTemp: bodyTemp,
    timeBodyTemp: timeBodyTemp,
  };
  User.findById(req.session.user._id)
    .then((user) => {
      user.bodyTemps.push(temp);
      user
        .save()
        .then((user) => {
          console.log(user);
          console.log("Created Temp");
          res.render("staff/covid", {
            pageTitle: "Thông tin Covid",
            path: "/covid",
            confirmTemp: "Bạn đã đăng ký thông tin thân nhiệt thành công!",
            confirmVaccine: "",
            confirmCovid: "",
          });
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
};

// Vaccine
exports.postVaccine = (req, res, next) => {
  const typeVac = req.body.typeVac;
  const name = req.body.name;
  const date = req.body.date;
  const vaccine = {
    type: typeVac,
    name: name,
    date: date,
  };
  User.findById(req.session.user._id)
    .then((user) => {
      user.vaccines.push(vaccine);
      user
        .save()
        .then((user) => {
          console.log(user);
          console.log("Created Vaccine");
          res.render("staff/covid", {
            pageTitle: "Thông tin Covid",
            path: "/covid",
            confirmTemp: "",
            confirmVaccine: "Bạn đã đăng ký thông tin tiêm vaccine thành công!",
            confirmCovid: "",
          });
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
};

// Covid
exports.postCovid = (req, res, next) => {
  const dateCovid = req.body.dateCovid;
  const covid = {
    dateCovid: dateCovid,
  };
  User.findById(req.session.user._id)
    .then((user) => {
      user.covids.push(covid);
      user
        .save()
        .then((user) => {
          console.log(user);
          console.log("Created positive Covid");
          res.render("staff/covid", {
            pageTitle: "Thông tin Covid",
            path: "/covid",
            confirmTemp: "",
            confirmVaccine: "",
            confirmCovid:
              "Bạn đã đăng ký thông tin dương tính Covid thành công!",
          });
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
};
