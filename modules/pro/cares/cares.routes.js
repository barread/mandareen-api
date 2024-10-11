const router = require("express").Router();
const proController = require("./cares.controller");

//patients
router.route("/pro/cares").get(proController.getCares);

module.exports = router;
