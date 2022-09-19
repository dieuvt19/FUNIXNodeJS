const path = require("path");

const express = require("express");

const staffController = require("../controllers/staff");
const { randomBytes } = require("crypto");

const isAuth = require("../middleware/is-auth");
const { authRole } = require("../middleware/is-manager");
const { redirectPrePage } = require("../middleware/redirectPrePage");

const router = express.Router();

router.get("/", isAuth, staffController.getIndex);

// Route roll-call
router.get(
  "/roll-call",
  redirectPrePage("/roll-call"),
  isAuth,
  authRole("STAFF"),
  staffController.getRollCall
);

router.get(
  "/check-in",
  redirectPrePage("/check-in"),
  isAuth,
  authRole("STAFF"),
  staffController.getCheckIn
);

router.post(
  "/check-in",
  isAuth,
  authRole("STAFF"),
  staffController.postCheckIn
);

router.get(
  "/check-out",
  redirectPrePage("/check-out"),
  isAuth,
  authRole("STAFF"),
  staffController.getCheckOut
);

router.post(
  "/check-out",
  isAuth,
  authRole("STAFF"),
  staffController.postCheckOut
);

router.get(
  "/check-details",
  redirectPrePage("/check-details"),
  isAuth,
  authRole("STAFF"),
  staffController.getCheckDetails
);

router.get(
  "/annualLeave",
  redirectPrePage("/annualLeave"),
  isAuth,
  authRole("STAFF"),
  staffController.getAnnualLeave
);

router.post(
  "/annualLeave",
  isAuth,
  authRole("STAFF"),
  staffController.postAnnualLeave
);

// Route read/edit info-staff
router.get(
  "/infoStaff",
  redirectPrePage("/infoStaff"),
  isAuth,
  authRole("STAFF"),
  staffController.getInfoStaff
);

router.get(
  "/edit-infoStaff/:staffId",
  redirectPrePage("/edit-infoStaff/:staffId"),
  isAuth,
  staffController.getEditInfoStaff
);

router.post(
  "/edit-infoStaff",
  isAuth,
  authRole("STAFF"),
  staffController.postEditInfoStaff
);

// Route search

router.get(
  "/search",
  redirectPrePage("/search"),
  isAuth,
  authRole("STAFF"),
  staffController.getSearch
);

router.post("/search", isAuth, authRole("STAFF"), staffController.postSearch);

router.post(
  "/search-salary",
  redirectPrePage("/search-salary"),
  isAuth,
  authRole("STAFF"),
  staffController.postSearchSalary
);

router.post(
  "/search-date",
  redirectPrePage("/search-date"),
  isAuth,
  authRole("STAFF"),
  staffController.postSearchDate
);

// Covid
router.get(
  "/covid",
  redirectPrePage("/covid"),
  isAuth,
  authRole("STAFF"),
  staffController.getInfoCovid
);

router.post(
  "/temp-details",
  isAuth,
  authRole("STAFF"),
  staffController.postTemp
);

router.post(
  "/vaccine-details",
  isAuth,
  authRole("STAFF"),
  staffController.postVaccine
);

router.post(
  "/covid-details",
  isAuth,
  authRole("STAFF"),
  staffController.postCovid
);

module.exports = router;
