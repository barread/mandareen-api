const router = require("express").Router();
const proController = require("./seance.controller");

//reports
router.route("/pro/seance/get/:id").get(proController.getSeanceData);
router.route("/pro/seance/getbypatient/:id").get(proController.getSesanceDataByPatient);
router.route("/pro/seance/getbyid/:id").get(proController.getSesanceDataByid);
router.route("/pro/seance/getmoodsbysessionid/:id").get(proController.getSesanceMoodsBySessionid);
router.route("/pro/seance/delete/:id").delete(proController.deleteSeanceData);

module.exports = router;
