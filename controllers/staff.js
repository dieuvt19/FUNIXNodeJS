const User = require("../models/user");
const Check = require("../models/check");
const AnnualLeave = require("../models/annualLeave");
const Temp = require("../models/temp");
const Vaccine = require("../models/vaccine");
const Covid = require("../models/covid");
const { response } = require("express");

const moment = require("moment");

// Screen 1: Roll-call

exports.getRollCall = (req, res, next) => {
  res.render("staff/index", {
    pageTitle: "Điểm danh",
    path: "/",
  });
};

exports.getCheckIn = (req, res, next) => {
  Check.findOne({ starting: true })
    .populate("userId", "name")
    .then((check) => {
      console.log(check);
      if (check) {
        res.render("staff/check-in", {
          pageTitle: "Check in",
          path: "/check-in",
          check: check,
          starting: true,
          alert: "",
        });
      } else {
        User.findById("630089076575b9df797c0f6a")
          .then((user) => {
            res.render("staff/check-in", {
              pageTitle: "Check in",
              path: "/check-in",
              user: user,
              starting: false,
            });
          })
          .catch((err) => console.log(err));
      }
    })
    .catch((err) => console.log(err));
};

exports.postCheckIn = (req, res, next) => {
  Check.findOne({ starting: true })
    .then((check) => {
      if (check) {
        return res.render("staff/check-in", {
          pageTitle: "Check in",
          check: check,
          path: "/check-in",
          starting: true,
          alert: "Vui lòng kết thúc lần điểm danh trước đó!",
        });
      } else {
        const workPlace = req.body.workPlace;
        let checkin = new Date();
        const check = new Check({
          workPlace: workPlace,
          checkin: checkin,
          created: moment(checkin).format("YYYY-MM-DD"),
          starting: true,
          userId: req.user,
        });
        check
          .save()
          .then((check) => {
            console.log(check);
            console.log("Start work");
            res.render("staff/check-in", {
              pageTitle: "Check in",
              path: "/check-in",
              check: check,
              starting: true,
              alert: "Bạn đã điểm danh thành công!",
            });
          })
          .catch((err) => console.log(err));
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getCheckOut = (req, res, next) => {
  Check.findOne({ starting: true })
    .then((check) => {
      console.log(check);
      if (check) {
        res.render("staff/check-out", {
          pageTitle: "Check out",
          path: "/check-out",
          check: check,
          starting: true,
        });
      } else {
        res.render("staff/check-out", {
          pageTitle: "Check out",
          path: "/check-out",
          starting: false,
        });
      }
    })
    .catch((err) => console.log(err));
};

exports.postCheckOut = (req, res, next) => {
  const checkId = req.body.checkId;
  const checkout = new Date();
  Check.findById(checkId)
    .then((check) => {
      check.checkout = checkout;
      check.starting = false;
      check.timeWork = (
        moment(checkout).diff(moment(check.checkin), "minutes") / 60
      ).toFixed(2);
      console.log(check.timeWork);
      check.save();
      res.redirect("/check-details");
    })
    .catch((err) => console.log(err));
};

exports.getCheckDetails = (req, res, next) => {
  let today = moment(new Date()).format("YYYY-MM-DD");
  Check.find({ checkin: { $gte: today } })
    .then((checks) => {
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
  User.findById("630089076575b9df797c0f6a").then((user) => {
    console.log(user);
    res.render("staff/annualLeave", {
      user: user,
      pageTitle: "Đăng ký nghỉ phép",
      path: "/annualLeave",
    });
  });
};

exports.postAnnualLeave = (req, res, next) => {
  const typeLeave = req.body.typeLeave;
  const dateLeave = req.body.dateLeave;
  const hourLeave = req.body.hourLeave;
  const reason = req.body.reason;
  const annualLeave = new AnnualLeave({
    typeLeave: typeLeave,
    dateLeave: dateLeave,
    hourLeave: hourLeave,
    reason: reason,
    userId: req.user,
  });
  annualLeave
    .save()
    .then((anl) => {
      console.log(anl);
      console.log(annualLeave.dateLeave.length);
      if (annualLeave.typeLeave === "Theo ngày") {
        return req.user.countDateAnl(annualLeave.dateLeave.length);
      } else {
        return req.user.countDateAnl(hourLeave / 8);
      }
    })
    .then((result) => {
      console.log("Created annualLeave");
      res.redirect("/annualLeave");
    })
    .catch((err) => console.log(err));
};

// Screen 2: information staff

exports.getInfoStaff = (req, res, next) => {
  User.findById("630089076575b9df797c0f6a")
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
  const userId = req.params.staffId;
  console.log(userId);
  User.findById(userId)
    .then((user) => {
      console.log(user);
      res.render("staff/edit-infoStaff", {
        user: user,
        pageTitle: "Xem/Sửa thông tin cá nhân",
        path: "/edit-infoStaff",
      });
    })
    .catch((err) => console.log(err));
};

exports.postEditInfoStaff = (req, res, next) => {
  const userId = req.body.userId;
  const updatedImage = req.body.image;

  User.findById(userId)
    .then((user) => {
      user.image = updatedImage;
      return user.save();
    })
    .then((result) => {
      console.log("UPDATED STAFF!");
      res.redirect("/infoStaff");
    })
    .catch((err) => console.log(err));
};

// Screen 3: Search

exports.getSearch = (req, res, next) => {
  User.findById("630089076575b9df797c0f6a")
    .populate({ path: "checks" })
    .populate({ path: "annualLeaves" })
    .then((user) => {
      Check.aggregate([
        {
          $group: {
            _id: "$created",
            countCheck: { $sum: 1 },
            sumHour: { $sum: "$timeWork" },
          },
        },
        { $sort: { _id: 1 } },
      ])
        .then((data) => {
          console.log(data);

          res.render("staff/search", {
            pageTitle: "Tra cứu",
            path: "/search",
            user: user,
            data: data,
          });
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
};

// Search salary
exports.postSearchSalary = (req, res, next) => {
  const monthSearch = req.body.salaryMonth;
  console.log(monthSearch);
  let start = monthSearch + "-01";
  let end = monthSearch + "-31";

  User.findById("630089076575b9df797c0f6a")
    .populate({ path: "checks" })
    .populate({ path: "annualLeaves" })
    .then((user) => {
      Check.aggregate([
        {
          $match: { created: { $gte: start, $lte: end } },
        },
        {
          $group: {
            _id: "$created",
            countCheck: { $sum: 1 },
            sumHour: { $sum: "$timeWork" },
          },
        },
        { $sort: { _id: 1 } },
      ])
        .then((checks) => {
          console.log(checks);
          // total working time
          let totalTimeWork = 0;
          checks.forEach((check) => {
            return (totalTimeWork += check.sumHour);
          });
          console.log(totalTimeWork);

          AnnualLeave.find({ dateLeave: { $gte: start, $lte: end } })
            .then((anls) => {
              console.log(anls);

              // total working time
              let totalAnnualLeave = 0;
              anls.forEach((anl) => {
                if (anl.typeLeave === "Theo ngày") {
                  anl.hourLeave = anl.dateLeave.length * 8;
                }
                return (totalAnnualLeave += anl.hourLeave);
              });
              console.log(totalAnnualLeave);

              // overtime
              const overTime =
                totalTimeWork > checks.length * 8
                  ? totalTimeWork - checks.length * 8
                  : 0;

              // missingHours
              const missingHours =
                checks.length * 8 - totalAnnualLeave - totalTimeWork;

              // salary
              const salary =
                user.salaryScale * 3000000 + (overTime - missingHours) * 200000;

              res.render("staff/search-salary", {
                pageTitle: "Tra cứu lương tháng",
                path: "/search-salary",
                monthSearch: monthSearch,
                user: user,
                checks: checks,
                totalTimeWork: totalTimeWork,
                missingHours: missingHours,
                overTime: overTime,
                salary: salary,
              });
            })
            .catch((err) => console.log(err));
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
};

exports.postSearchDate = (req, res, next) => {
  const searchDate = req.body.searchDate;
  console.log(searchDate);
  Check.find({ created: searchDate, userId: "630089076575b9df797c0f6a" })
    .then((checks) => {
      console.log(checks);

      const isCheckout = checks.filter((check) => check.starting === true);
      console.log(isCheckout);

      let total = 0;
      checks.forEach((check) => {
        total += check.timeWork;
        console.log(total);
        return total;
      });

      res.render("staff/search-date", {
        pageTitle: "Tra cứu điểm danh theo ngày",
        path: "/search-date",
        checks: checks,
        total: total,
        searchDate: searchDate,
        isCheckout: isCheckout,
      });
    })
    .catch((err) => console.log(err));
};

// Screen 4: Covid
exports.getInfoCovid = (req, res, next) => {
  res.render("staff/covid", {
    pageTitle: "Thông tin Covid",
    path: "/covid",
  });
};

// bodyTemp
exports.postTemp = (req, res, next) => {
  const bodyTemp = req.body.bodyTemp;
  const timeBodyTemp = new Date();
  const temp = new Temp({
    bodyTemp: bodyTemp,
    timeBodyTemp: timeBodyTemp,
    userId: req.user,
  });
  temp
    .save()
    .then((temps) => {
      console.log(temps);
      console.log("Created Temp");
      res.redirect("/temp-details");
    })
    .catch((err) => console.log(err));
};

exports.getTemp = (req, res, next) => {
  Temp.find()
    .then((temps) => {
      console.log(temps);
      res.render("staff/temp-details", {
        pageTitle: "Thông tin thân nhiệt",
        path: "/temp-details",
        temps: temps,
      });
    })
    .catch((err) => console.log(err));
};

// Vaccine
exports.postVaccine = (req, res, next) => {
  const typeVac = req.body.typeVac;
  const name = req.body.name;
  const date = req.body.date;
  const vaccine = new Vaccine({
    type: typeVac,
    name: name,
    date: date,
    userId: req.user,
  });
  vaccine
    .save()
    .then((vac) => {
      console.log(vac);
      console.log("Created Vaccine");
      res.redirect("/vaccine-details");
    })
    .catch((err) => console.log(err));
};

exports.getVaccine = (req, res, next) => {
  Vaccine.find()
    .then((vacs) => {
      console.log(vacs);
      res.render("staff/vaccine-details", {
        pageTitle: "Thông tin tiêm Vaccine",
        path: "/vaccine-details",
        vacs: vacs,
      });
    })
    .catch((err) => console.log(err));
};

// Covid
exports.postCovid = (req, res, next) => {
  const dateCovid = req.body.dateCovid;
  const covid = new Covid({
    dateCovid: dateCovid,
    userId: req.user,
  });
  covid
    .save()
    .then((covid) => {
      console.log(covid);
      console.log("Created positive Covid");
      res.redirect("/covid-details");
    })
    .catch((err) => console.log(err));
};

exports.getCovid = (req, res, next) => {
  Covid.find()
    .then((covids) => {
      console.log(covids);
      res.render("staff/covid-details", {
        pageTitle: "Thông tin dương tính Covid",
        path: "/covid-details",
        covids: covids,
      });
    })
    .catch((err) => console.log(err));
};
