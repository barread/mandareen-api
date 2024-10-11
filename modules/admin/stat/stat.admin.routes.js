const router = require("express").Router();
const adminController = require("./stat.admin.controller");

router.route("/admin/allstats/:date").get(adminController.getAllStat);
router.route("/admin/exportstats/:date").get(adminController.getExportStat);

module.exports = router;
