const express = require("express");

const managerController = require("../controllers/manager");

const isAuth = require("../middleware/is-auth");
const { authRole } = require("../middleware/is-manager");
const { redirectPrePage } = require("../middleware/redirectPrePage");
const { route } = require("./staff");

const router = express.Router();

router.get("/", isAuth, managerController.getIndex);

router.get(
  "/confirm-checks",
  redirectPrePage("/confirm-checks"),
  isAuth,
  authRole("MANAGER"),
  managerController.getConfirmChecks
);

router.get(
  "/confirm-checks/:staffId",
  redirectPrePage("/confirm-checks/:staffId"),
  isAuth,
  authRole("MANAGER"),
  managerController.getConfirmCheck
);

router.post(
  "/confirm-check",
  isAuth,
  authRole("MANAGER"),
  managerController.postConfirmCheck
);

router.post(
  "/delete-check",
  isAuth,
  authRole("MANAGER"),
  managerController.postDeleteCheck
);

router.post(
  "/confirm-month",
  isAuth,
  authRole("MANAGER"),
  managerController.postConfirmMonth
);

router.get(
  "/manaCovid",
  redirectPrePage("/manaCovid"),
  isAuth,
  authRole("MANAGER"),
  managerController.getManaCovid
);

router.post(
  "/staff-covid",
  isAuth,
  authRole("MANAGER"),
  managerController.postStaffCovid
);

router.get(
  "/staff-covid/:staffId",
  redirectPrePage("/staff-covid/:staffId"),
  isAuth,
  authRole("MANAGER"),
  managerController.getCoviPDF
);

module.exports = router;
