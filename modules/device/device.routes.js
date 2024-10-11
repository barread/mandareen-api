const router = require("express").Router();
const passport = require("passport");
const devices = require("./device.controller");

router.route("/devices").post(devices.register());
router.route("/devices/limited/:nbOfDevices").get(devices.find());
router.route("/devices").delete(devices.delete());
router.route("/devices/ping").post(devices.ping());
router.route("/devices/sendNotifications").post(devices.sendNotifications());

module.exports = router;
