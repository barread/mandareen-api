const router = require("express").Router();
const adminController = require("./tools.admin.controller");

router.route("/admin/logs/:date").get(adminController.getLogs);
router.route("/admin/logfile/:filename").get(adminController.getLogFile);
router.route("/admin/logslist").get(adminController.getListLogs);
router.route("/admin/encryptall").get(adminController.encryptAll);
module.exports = router;
