const router = require("express").Router();
const proController = require("./sub.controller");

//reports
router.route("/pro/sub/current/:id").get(proController.getCurrentSub);
router.route("/pro/sub/pay").post(proController.payCurrentSub);
router.route("/pro/sub/request/").post(proController.postRequestSub);
router.route("/pro/sub/list/").get(proController.getSubList);

module.exports = router;
