const router = require("express").Router();
const adminController = require("./pros.admin.controller");

router.route("/admin/allpro/").get(adminController.getAllPro);
router.route("/admin/profilepro/").get(adminController.getProfilePro);
router.route("/admin/proupdate").post(adminController.updatePro);
module.exports = router;
