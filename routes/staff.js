const path = require("path");

const express = require("express");

const staffController = require("../controllers/staff");
const { randomBytes } = require("crypto");

const router = express.Router();

// Route roll-call
router.get("/", staffController.getRollCall);

router.get("/check-in", staffController.getCheckIn);

router.post("/check-in", staffController.postCheckIn);

router.get("/check-out", staffController.getCheckOut);

router.post("/check-out", staffController.postCheckOut);

router.get("/check-details", staffController.getCheckDetails);

router.get("/annualLeave", staffController.getAnnualLeave);

router.post("/annualLeave", staffController.postAnnualLeave);

// Route read/edit info-staff
router.get("/infoStaff", staffController.getInfoStaff);

router.get("/edit-infoStaff/:staffId", staffController.getEditInfoStaff);

router.post("/edit-infoStaff", staffController.postEditInfoStaff);

// Route search

router.get("/search", staffController.getSearch);

router.post("/search-salary", staffController.postSearchSalary);

router.get("/search-salary", staffController.getSearch);

router.post("/search-date", staffController.postSearchDate);

// router.get("/search-date", staffController.getSearchDate);

// Covid
router.get("/covid", staffController.getInfoCovid);

router.post("/temp-details", staffController.postTemp);

router.get("/temp-details", staffController.getTemp);

router.post("/vaccine-details", staffController.postVaccine);

router.get("/vaccine-details", staffController.getVaccine);

router.post("/covid-details", staffController.postCovid);

router.get("/covid-details", staffController.getCovid);

module.exports = router;
