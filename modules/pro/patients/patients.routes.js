const router = require("express").Router();
const proController = require("./patients.controller");

//patients
router.route("/pro/patients/proId/:id").get(proController.getPatientsByPro);
router.route("/pro/patients&Obj/proId/:id").get(proController.getPatientandObjectivesByPro);
router.route("/pro/patients").get(proController.getPatients);
router.route("/pro/patient/create/").post(proController.addPatient);
router.route("/pro/patient/startMandareenSession").post(proController.startMandareenSession);
router.route("/pro/patient/relaunchMandareenSession").put(proController.relaunchMandareenSession);
router.route("/pro/patient/recurrentSession/add").post(proController.addRecurrentSession);
router.route("/pro/patient/recurrentSession/:pro_id/:patient_id").get(proController.getRecurrentSession);
router.route("/pro/patient/recurrentSession/delete/:id").delete(proController.deleteRecurrentSession);
router.route("/pro/patient/recurrentSession/update").put(proController.updateRecurrentSession);
router.route("/pro/patient/id/:id").get(proController.getPatientById);
router.route("/pro/patient/stats/:id").get(proController.getStatsById);
router.route("/pro/patient/allstats/:id").get(proController.getAllStatsById);
router.route("/pro/patient/update").put(proController.updatePatient);
router.route("/pro/patient/resetPassword").put(proController.resetPassword);
router.route("/pro/patient/objectives/:id").get(proController.getObjectivesByPatient);
router.route("/pro/patient/createobjective").post(proController.addObjective);
router.route("/pro/patient/updateobjective").put(proController.updateObjective);
router.route("/pro/patient/deleteobjective/id/:id").delete(proController.deleteObjective);
module.exports = router;
