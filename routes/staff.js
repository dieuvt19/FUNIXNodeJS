const path = require("path");

const express = require("express");

const staffController = require("../controllers/staff");
const { randomBytes } = require("crypto");

const isAuth = require("../middleware/is-auth");

const router = express.Router();

router.get("/", isAuth, staffController.getIndex);

// Route roll-call
router.get("/roll-call", isAuth, staffController.getRollCall);

router.get("/check-in", isAuth, staffController.getCheckIn);

router.post("/check-in", isAuth, staffController.postCheckIn);

router.get("/check-out", isAuth, staffController.getCheckOut);

router.post("/check-out", isAuth, staffController.postCheckOut);

router.get("/check-details", isAuth, staffController.getCheckDetails);

router.get("/annualLeave", isAuth, staffController.getAnnualLeave);

router.post("/annualLeave", isAuth, staffController.postAnnualLeave);

// Route read/edit info-staff
router.get("/infoStaff", isAuth, staffController.getInfoStaff);

router.get(
  "/edit-infoStaff/:staffId",
  isAuth,
  staffController.getEditInfoStaff
);

router.post("/edit-infoStaff", isAuth, staffController.postEditInfoStaff);

// Route search

router.get("/search", isAuth, staffController.getSearch);

router.post("/search", isAuth, staffController.postSearch);

router.post("/search-salary", isAuth, staffController.postSearchSalary);

router.post("/search-date", isAuth, staffController.postSearchDate);

// Covid
router.get("/covid", isAuth, staffController.getInfoCovid);

router.post("/temp-details", isAuth, staffController.postTemp);

router.post("/vaccine-details", isAuth, staffController.postVaccine);

router.post("/covid-details", isAuth, staffController.postCovid);

module.exports = router;
