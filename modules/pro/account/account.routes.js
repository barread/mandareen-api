const router = require("express").Router();
const proController = require("./account.controller");

router.route("/pro/account/update").put(proController.update);
router.route("/pro/account/email").put(proController.updateEmail);
router.route("/pro/account/password").put(proController.updatePassword);

module.exports = router;
