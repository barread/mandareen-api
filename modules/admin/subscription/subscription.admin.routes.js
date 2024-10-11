const router = require("express").Router();
const adminController = require("./subscription.admin.controller");

router.route("/admin/allsubs/:filter").get(adminController.getAllSubsFilter);
router.route("/admin/allsubs/").get(adminController.getAllSubs);
router.route("/admin/tooglesub/").post(adminController.ToogleSub);
router.route("/admin/deletesub/").delete(adminController.DeleteSub);

router.route("/admin/sublist/").get(adminController.getSubList);
router.route("/admin/subform/:id").get(adminController.getSub);
router.route("/admin/editsubform/").post(adminController.updateSub);
router.route("/admin/createsubform/").post(adminController.createSub);
router.route("/admin/deletesubform/").post(adminController.deleteASub);


module.exports = router;
