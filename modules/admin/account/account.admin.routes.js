const router = require("express").Router();
const adminController = require("./account.admin.controller");

router.route("/admin/login/").post(adminController.adminLogin);
router.route("/admin/add/").post(adminController.addAdmin);
router.route("/admin/update/").post(adminController.updateAdmin);
router.route("/admin/reset").post(adminController.resetPwd);
router.route("/admin/passwd").post(adminController.passwd);
router.route("/admin/delete").delete(adminController.deleteAdmin);
module.exports = router;