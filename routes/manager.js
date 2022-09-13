const express = require("express");

const managerController = require("../controllers/manager");

const isAuth = require("../middleware/is-auth");
const isManager = require("../middleware/is-manager");
const { route } = require("./staff");

const router = express.Router();

router.get("/", isAuth, managerController.getIndex);

router.get("/confirm-checks", isAuth, managerController.getConfirmChecks);

router.get(
  "/confirm-checks/:staffId",
  isAuth,
  managerController.getConfirmCheck
);

router.post("/delete-check", isAuth, managerController.postDeleteCheck);

router.post("/confirm-month", isAuth, managerController.postConfirmMonth);

router.get("/manaCovid", isAuth, managerController.getManaCovid);

router.post("/staff-covid", isAuth, managerController.postStaffCovid);

router.get("/staff-covid/:staffId", isAuth, managerController.getCoviPDF);

module.exports = router;
