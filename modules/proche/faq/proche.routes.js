const router = require("express").Router();
const procheController = require("./proche.controller");

router.route("/proche/answers").get(procheController.list);

module.exports = router;
