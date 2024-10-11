const router = require("express").Router();
const proController = require("./reports.controller");

//reports
router.route("/pro/reports/proId/:id").get(proController.getReportsByPro);
router.route("/pro/report/id/:id").get(proController.getReportById);
router.route("/pro/report/id/:id").delete(proController.delete);
router.route("/pro/report/id/:id").put(proController.update);
router.route("/pro/reports/patientId/:id").get(proController.getReportsByPatient);

router.route("/pro/report/new").post(proController.create);

module.exports = router;
