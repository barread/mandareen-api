var crypt = require('../../../utils/encryption')
var bcrypt = require("bcrypt");
var jwtUtils = require("../../../utils/jwt.utils");
var models = require("../../../models/index");
var verifPro = require("../../../utils/pro_sub.utils");
const debug = require("debug")("app:patients.controller");
const path = require("path");
const mail = require(path.resolve("./libs/mail"));
const oneSignal = require(path.resolve("./libs/oneSignal"));
var Stats = require('../../../utils/statistics');
var Logs = require('../../../utils/file_log_system');

//routes
module.exports = {
    getPatientandObjectivesByPro: function(req, res, next) {
        debug("getPatientandObjectivesByPro");

        Stats.UpdateRequestStat("Pro");
        let patients = [];
        let followups = [];

        return Promise.resolve()
            .then(test)
            .then(() => {
                for (var i = 0; i < followups.length; i++) {
                    models.Patient.findOne({
                        where: {id: followups[i].patient_id},
                        include: [
                            {
                                model: models.Objectives,
                            }
                        ]
                    }).then(function (patientFound) {
                        patients.push(patientFound);
                        if (patients.length == followups.length) {
                            Logs.LogSuccessIP(req, 200, "getPatientandObjectivesByPro : success");
                            res.json(patients);
                        }
                    });
                }
            }).catch(next);

        function test() {
            return models.Followup.findAll({
                attributes: ["patient_id"],
                where: { pro_id: req.params.id, is_active: true }
            }).then(function(followupFound) {
                followups = followupFound;
            }).then(function () {
            }).catch(next);
        }
    },

  getPatientsByPro: function(req, res, next) {
    debug("getPatientsByPro");

    Stats.UpdateRequestStat("Pro");
    let followups = [];
    let patients = [];

    return Promise.resolve()
      .then(findFollowupLinkedToPro)
      .then(getUniquePatients)
      .then(() => {
        Logs.LogSuccessIP(req, 200, "GetPatientsByPro : success");
        res.json(patients);
      })
      .catch(next);

    function findFollowupLinkedToPro() {
      return models.Followup.findAll({
        where: { pro_id: req.params.id, is_active: true },
        include: [
          {
            model: models.Patient,
            attributes: { exclude: ["password"] }
          }
        ]
      }).then(function(_followups) {
        followups = _followups;
      });
    }

    function getUniquePatients() {
      patients = followups.filter(followup => {
        return followup.patient;
      });
    }
  },
  getPatients: function(req, res, next) {
    debug("getPatients");

    Stats.UpdateRequestStat("Pro");
    let patients = [];

    return Promise.resolve()
      .then(getPatients)
      .then(() => {
        Logs.LogSuccessIP(req, 200, "getPatients : success");
        res.json(patients);
      })
      .catch(next);

    function getPatients() {
      return models.Patient.findAll({
        attributes: { exclude: ["password"] }
      }).then(function(_patients) {
        patients = _patients;
      });
    }
  },
  addPatient: function(req, res, next) {
    debug("addPatient");

    Stats.UpdateRequestStat("Pro");
    var email = req.body.email.toLowerCase();
    var password = req.body.password;
    var civ = req.body.civility;
    var firstname = req.body.firstname;
    var lastname = req.body.lastname;
    var birthdate = req.body.birthdate;
    var pro_id = req.body.pro_id;
    var care_id = req.body.selectedCareId;

    if (
      !email ||
      !password ||
      !civ ||
      !firstname ||
      !lastname ||
      !birthdate ||
      !pro_id
    ) {
      Logs.LogError(400, "AddPatient: missing parameters");
      return res.status(400).json({ error: "missing paramaters" });
    }
    // TODO verification

    return verifPro.CanCreatePatient(pro_id).then(function(valid) {
      if (valid) {
        return models.Patient.findOne({
          attributes: ["email"],
          where: { email: crypt.Encrypt(email) }
        })
          .then(function(patientFound) {
            if (!patientFound) {
              bcrypt.hash(password, 5, function(err, bcryptedPassword) {
                return models.Patient.create({
                  email: email,
                  pass: bcryptedPassword,
                  civ: civ,
                  firstname: firstname,
                  lastname: lastname,
                  birthdate: birthdate
                })
                  .then(() => {
                    return models.Patient.findOne({
                      attributes: ["id"],
                      where: { email: crypt.Encrypt(email) }
                    }).then(function(newPatient) {
                      if (care_id) {
                        models.Followup.create({
                          care_id: care_id,
                          patient_id: newPatient.id,
                          pro_id: pro_id
                        });
                      }
                      Logs.LogSuccessIP(req, 200, "AddPatient : success")
                      return res.status(200).json({ patientId: newPatient.id });
                    });
                  })
                  .catch(function(err) {
                    console.log("Error add patient");
                    console.log("Log : " + err);
                    Logs.LogError(500, "AddPatient: "+ err);
                    return res
                      .status(500)
                      .json({ error: "cannot add patient" });
                  });
              });
            } else {
              Logs.LogError(409, "AddPatient: patient already");
              return res.status(409).json({ error: "patient already exist" });
            }
          })
          .catch(function(err) {
            console.log("Error verify patient:");
            console.log("Log : " + err);
            Logs.LogError(500, "AddPatient: " + err);
            return res.status(500).json({ error: "unable to verify patient" });
          });
      } else {
        Logs.LogError(403, "AddPatient: Subscription expired");
        return res.status(403).json({ error: "Subscription expired" })
    };
    });
  },
    startMandareenSession: function (req, res, next) {
        debug("startMandareenSession");

        Stats.UpdateRequestStat("Pro");
        let tokens = [];

        id_patient = req.body.patient.id;

        return models.Sessions.create({
            patient_id: id_patient,
            text_situation: "",
            text_mood: "",
            text_automatic: "",
            text_rational: "",
            text_result: "",
            status: "En cours"
        })
            .then(function () {
                return models.Patient.findOne({
                    where: { id: req.body.patient.id },
                    include: { model: models.Device }
                })
                    .then(function (patient) {
                        if (patient["devices"].length > 0) {
                            tokens = patient["devices"].map(device => device.uuid);
                        }
                    })
                    .then(function () {
                        sendNotificationStartSessionToAllPatientDevices();
                    })
                    .then(function () {
                        if (tokens.length === 0) {
                          Logs.LogError(403, "startMandareenSession : Device not found");
                            return res.status(403).json({ error: "device not found" });
                        } else {
                          Logs.LogSuccessIP(req, 200, "startMandareenSession : success")
                            return res.json({ res: "OK" });
                        }
                    })
                    .catch(next);

                function sendNotificationStartSessionToAllPatientDevices() {
                    const notification = {
                        title: "Début de séance Mandareen",
                        content: "Cette séance a été démarrée par le professionnel",
                        type: "session",
                        tokens: tokens
                    };
                    return oneSignal.sendNotificationPrepared(notification);
                }
            })

    },

  relaunchMandareenSession: function(req, res, next) {
    let tokens = [];

    return models.Sessions.update({
        status: "En cours"
      }, {
        where: { id: req.body.session_id }
      }
    ).then(function() {
      return models.Patient.findOne({
        where: {id: req.body.patient_id},
        include: { model: models.Device }
      }).then(function(patient) {
        if (patient["devices"].length > 0) {
          tokens = patient["devices"].map(device => device.uuid);
        }
      }).then(function() {
        sendNotificationStartSessionToAllPatientDevices();
      }).then(function() {
        if (tokens.length === 0) {
          Logs.LogError(403, "relaunchMandareenSession: device not found");
          return res.status(403).json({error: "device not found"});
        } else {
          Logs.LogSuccessIP(req, 200, "relaunchMandareenSession: success");
          return res.json({res: "OK"})
        }
      }).catch(next);

      function sendNotificationStartSessionToAllPatientDevices() {
        const notification = {
          title: "Relance de séance Mandareen",
          content: "Une séance a été redémarrée par le professionnel",
          type: "session",
          tokens: tokens
        };
        return oneSignal.sendNotificationPrepared(notification);
      }
    })
  },

  addRecurrentSession: function(req, res, next) {
    Stats.UpdateRequestStat("Pro");

    return models.Session_recurr.create({
      pro_id: req.body.pro_id,
      patient_id: req.body.patient_id,
      recurrence: req.body.freq
    }).then(function() {
      return res.json({res: "OK"});
    })
  },

  getRecurrentSession: function(req, res, next) {
    Stats.UpdateRequestStat("Pro");
    return models.Session_recurr.findAll({
      where: {
        patient_id: req.params.patient_id,
        pro_id: req.params.pro_id
      }
    }).then(function(recurrent_sessions) {
      Logs.LogSuccessIP(req, 200, "getRecurrentSession : success");
      return res.json(recurrent_sessions);
    })
    .catch(next);
  },

  updateRecurrentSession: function(req, res, next) {
    Stats.UpdateRequestStat("Pro");
    return models.Session_recurr.update(
      {
        recurrence: req.body.freq
      },
      {
        where: { id: req.body.recurrent_session_id }
      }
    ).then(function(recurrent_session) {
      Logs.LogSuccessIP(req, 200, "updateRecurrentSession : success");
      return res.json(recurrent_session);
    })
    .catch(next);
  },

  deleteRecurrentSession: function(req, res, next) {
    Stats.UpdateRequestStat("Pro");
    return models.Session_recurr.destroy({where: {id: req.params.id}})
      .then(function () {
        Logs.LogSuccessIP(req, 200, "deleteRecurrentSession : success");
        return res.status(200).json({res: "OK"});
      })
      .catch(function (err) {
        Logs.LogError(500, "deleteRecurrentSession : " + err);
        return res.status(500).json({error: "Failed to remove recurrent session"});
      });
  },

  getPatientById: function(req, res, next) {
    debug("getPatientById");

    Stats.UpdateRequestStat("Pro");
    return models.Patient.findOne({
      where: {
        id: req.params.id
      }
    })
      .then(function(patient) {
        Logs.LogSuccessIP(req, 200, "getPatientById : success");
        return res.json(patient);
      })
      .catch(next);
  },

  getStatsById: function(req, res, next) {
    debug("getStatsById");

    Stats.UpdateRequestStat("Pro");
    return models.Stats.findOne({
      where: {
        id_patient: req.params.id
      },
        order: [
            ['report_date', 'DESC'],
        ],
    })
      .then(function(Stats) {
        Logs.LogSuccessIP(req, 200, "getStatsById : success");
        return res.json(Stats);
      })
      .catch(next);
  },
    getAllStatsById: function(req, res, next) {
        debug("getAllStatsById");

        Stats.UpdateRequestStat("Pro");
        return models.Stats.findAll({
            where: {
                id_patient: req.params.id
            },
            attributes: {exclude: [
                'music_genre', 'id', 'id_patient']}

        })
            .then(function(Stats) {
                Logs.LogSuccessIP(req, 200, "getAllStatsById : success");
                return res.json(Stats);
            })
            .catch(next);
    },
  updatePatient: function(req, res, next) {
    debug("updatePatient");

    Stats.UpdateRequestStat("Pro");
    console.log(req.body);
    return models.Patient.update(req.body, { where: { id: req.body.id } })
      .then(function(patient) {
        Logs.LogSuccessIP(req, 200, "updatePatient : success");
        return res.json(patient);
      })
      .catch(next);
  },

  resetPassword: function(req, res, next) {
    debug("updatePatient");

    Stats.UpdateRequestStat("Pro");
    let patient = null;

        models.Patient.findById(req.body.id)
            .then(function (_patient) {
                patient = _patient;
            })
            .then(function () {
                return patient.resetPassword();
            })
            .then(function (newPassword) {
                return mail.send("patients/reset-password", {
                    to:
                        patient.firstname +
                        " " +
                        patient.lastname +
                        "<" +
                        patient.email +
                        ">",
                    subject: "Reinitialisation de votre mot de passe",
                    password: newPassword
                });
            })
            .then(() => {
              Logs.LogSuccessIP(req, 200, "resetPassword : success");
                res.json({ok: true});
            })
            .catch(next);
    },

    getObjectivesByPatient(req, res, next) {
        debug("getObjectivesByPatient");

        Stats.UpdateRequestStat("Pro");
        return models.Objectives.findAll({
            where: {
                patient_id: req.params.id,
            },
            order: [
                ['due_date', 'ASC']
            ]
        })
            .then(function (objectives) {
              Logs.LogSuccessIP(req, 200, "getObjectivesByPatient : success");
                return res.json(objectives);
            })
            .catch(next);
    },

    addObjective(req, res, next) {
        debug("addObjective");

        Stats.UpdateRequestStat("Pro");
        return models.Objectives.create({
            patient_id: req.body.id_patient,
            obj_sleep: req.body.obj_sleep,
            obj_cal: req.body.obj_cal,
            obj_sport: req.body.obj_sport,
            nb_sleep: 0,
            nb_cal: 0,
            nb_sport: 0,
            due_date: req.body.due_date,
        })
            .then(function (obj) {
              Logs.LogSuccessIP(req, 200, "addObjective : success");
                return res.json(obj);
            }).catch(function (err) {
                console.log("Error add objective");
                console.log("Log : " + err);
                Logs.LogError(500, "addObjective : " + err);
                return res
                    .status(500)
                    .json({error: "cannot add objective"});
            });
    },

    updateObjective: function(req, res, next) {
        debug("updateObjective");

        Stats.UpdateRequestStat("Pro");
        return models.Objectives.update({
            "obj_sleep": req.body.obj_sleep,
            "obj_sport": req.body.obj_sport,
            "obj_cal": req.body.obj_cal,
            "due_date": req.body.due_date
        }, { where: { id: req.body.id } })
            .then(function(obj) {
                Logs.LogSuccessIP(req, 200, "updateObj : success");
                return res.json(obj);
            })
            .catch(next);
    },

    deleteObjective(req, res, next) {
        debug("deleteObjective");

        Stats.UpdateRequestStat("Pro");
        return models.Objectives.destroy({where: {id: req.params.id}})
            .then(function () {
              Logs.LogSuccessIP(req, 200, "deleteObjective : success");
                return res.status(200).json({ok:true});
            })
            .catch(function (err) {
                console.log("Error remove objective");
                console.log("Log : " + err);
                Logs.LogError(500, "deleteObjective : " + err);
                return res
                    .status(500)
                    .json({error: "cannot remove objective"});
            });
    }


};
