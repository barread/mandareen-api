var bcrypt = require("bcrypt");
var jwtUtils = require("../../../utils/jwt.utils");
var models = require("../../../models/index");
const debug = require("debug")("app:followups.controller");
var verifPro = require("../../../utils/pro_sub.utils");
var Stats = require('../../../utils/statistics');
var Logs = require('../../../utils/file_log_system');

//routes
module.exports = {
  getFollowupsByPro: function(req, res, next) {
    debug("getFollowupsByPro");

    Stats.UpdateRequestStat("Pro");
    let followups = [];

    return Promise.resolve()
      .then(findFollowupLinkedToPro)
      .then(() => {
        res.json(followups);
      })
      .catch(next);

    function findFollowupLinkedToPro() {
      return models.Followup.findAll({
        where: { pro_id: req.params.id },
        include: [
          {
            model: models.Patient,
            attributes: { exclude: ["password"] }
          },
          {
            model: models.Care
          }
        ]
      }).then(function(_followups) {
        Logs.LogSuccessIP(req, 200, "getFollowupsByPro : success");
        followups = _followups;
      });
    }
  },
  create: function(req, res, next) {
    debug("create");

    Stats.UpdateRequestStat("Pro");
    return verifPro.IsValid(req.body.pro_id).then(function(valid) {
      if (valid) {
        return Promise.resolve()
          .then(createFollowup)
          .then(followup => {
            Logs.LogSuccessIP(req, 200, "CreateFollowUp : success");
            res.json(followup);
          })
          .catch(next);
      } else {
        Logs.LogError(403, "CreateFollowUp : subscription expired")
        return res.status(403).json({ error: "Subscription expired" });
    }
    });

    function createFollowup() {
      return models.Followup.create({
        care_id: req.body.care_id,
        patient_id: req.body.patient_id,
        pro_id: req.body.pro_id
      });
    }
  },

  disableFollowup: function(req, res, next) {
    return models.Followup.update(
      {
        is_active: false
      },
      {
        where: { id: req.params.id }
      }
    ).then(function (result) {
      return res.json(result);
    }).catch(function (err) {
      console.log("Error updating followup");
      console.log("Log : " + err);
      Logs.LogError(500, "disableFollowup : " + err)
      return res.status(500).json({ Error: "Cannot update diary" });
    });
  }
};
