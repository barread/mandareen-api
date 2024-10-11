const router = require("express").Router();
const proController = require("./bug-system.controller");

router.route("/pro/bug/send").post(proController.send);
router.route("/pro/bug/send_contact").post(proController.send_contact);

module.exports = router;
