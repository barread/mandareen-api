var jwtUtils = require("../../../utils/jwt.utils");
var Logs = require("../../../utils/file_log_system");
var models = require("../../../models/index");
var crypt = require("../../../utils/encryption");
var Stats = require("../../../utils/statistics");
var moment = require("moment");
var sequelize = models.sequelize;

let EncryptTimeStamp = moment("2018-01-01");

//routes
module.exports = {
  getLogs: function(req, res) {
    Stats.UpdateRequestStat("Admin");
    var headerAuth = req.headers["authorization"];
    var adminId = jwtUtils.getAdminId(headerAuth, 1);
    var date = req.params.date;
    if (adminId < 0) {
      Logs.LogErrorIP(req, "401", "getAllPro : wrong token");
      return res.status(401).json({ error: "wrong token" });
    }
    var logs = Logs.GetLogsFromDate(date);
    var logsNames = Logs.GetAllFilename();
    if (logs == "err" || logsNames == "err") {
      return res
        .status(500)
        .json({ error: "error with log file (maybe it don't exist ?)" });
    } else {
      Logs.LogSuccessIP(req, "200", "GetLogs : ok");
      return res
        .status(200)
        .json({ name: "logs_" + date + ".log", logs: logs, list: logsNames });
    }
  },
  getLogFile: function(req, res) {
    Stats.UpdateRequestStat("Admin");
    var headerAuth = req.headers["authorization"];
    var adminId = jwtUtils.getAdminId(headerAuth, 1);
    var file = req.params.filename;
    if (adminId < 0) {
      Logs.LogErrorIP(req, "401", "getAllPro : wrong token");
      return res.status(401).json({ error: "wrong token" });
    }
    var logs = Logs.GetLogsFromFile(file);
    var logsNames = Logs.GetAllFilename();
    if (logs == "err" || logsNames == "err") {
      return res
        .status(500)
        .json({ error: "error with log file (maybe it don't exist ?)" });
    } else {
      Logs.LogSuccessIP(req, "200", "GetLogs : ok");
      return res
        .status(200)
        .json({ name: file, logs: logs, list: logsNames });
    }
  },
  getListLogs: function(req, res) {
    Stats.UpdateRequestStat("Admin");
    var headerAuth = req.headers["authorization"];
    var adminId = jwtUtils.getAdminId(headerAuth, 1);
    if (adminId < 0) {
      Logs.LogErrorIP(req, "401", "getAllPro : wrong token");
      return res.status(401).json({ error: "wrong token" });
    }
    var logsName = Logs.GetAllFilename();
    if (logsName == "err") {
      return res.status(500).json({ error: "error getting list of logs" });
    } else {
      Logs.LogSuccessIP(req, "200", "GetListLogs : ok");
      return res.status(200).json({ list: logsName });
    }
  },
  encryptAll: function(req, res) {
    var now = moment();
    if (now.diff(EncryptTimeStamp, "minutes", true) > 2.0) {
      EncryptTimeStamp = moment();
      Stats.UpdateRequestStat("Admin");
      var headerAuth = req.headers["authorization"];
      var adminId = jwtUtils.getAdminId(headerAuth, 1);
      if (adminId < 0) {
        Logs.LogErrorIP(req, "401", "addAdmin : wrong token");
        return res.status(401).json({ error: "wrong token" });
      }
      return models.Admin.findOne({
        attributes: ["id", "login", "type"],
        where: { id: adminId }
      }).then(function(admin) {
        if (admin && admin.type == "Super-Admin") {
          return models.Admin.findAll({
            attributes: ["email", "firstname", "lastname"]
          }).then(function(admins) {
            encryptAdmin(admins).then(function() {
              return models.Pro.findAll({
                attributes: ["email", "firstname", "lastname", "adeli", "phone"]
              }).then(function(pros) {
                return encryptPro(pros).then(function() {
                  return models.Patient.findAll({
                    attributes: ["email", "firstname", "lastname"]
                  }).then(function(patients) {
                    return encryptPatient(patients).then(function() {
                      return models.Diary.findAll({
                        attributes: ["id", "content"]
                      }).then(function(diaries) {
                        return encryptDiary(diaries).then(function() {
                          return models.Report_pro.findAll({
                            attributes: ["id", "content"]
                          }).then(function(reports) {
                            return encryptReport(reports).then(function() {
                              return models.Sessions.findAll({
                                attributes: [
                                  "id",
                                  "text_situation",
                                  "text_mood",
                                  "text_automatic",
                                  "text_rational",
                                  "text_result"
                                ]
                              })
                                .then(function(sessions) {
                                  return encryptSession(sessions)
                                    .then(function() {
                                      Logs.LogSuccessIP(
                                        req,
                                        "200",
                                        "EncryptAll : encrypted"
                                      );
                                      console.log("ok");
                                      return res
                                        .status(200)
                                        .json({ response: "ok" });
                                    })
                                    .catch(e => {
                                      Logs.LogError(
                                        500,
                                        "encrypt session error: " + e
                                      );
                                    });
                                })
                                .catch(e => {
                                  Logs.LogError(
                                    500,
                                    "Fetch session error: " + e
                                  );
                                });
                            });
                          });
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        } else {
          Logs.LogErrorIP(req, "401", "EncyptAll : Not a super-admin");
          res.status(401).json({ error: "Not a super-admin" });
        }
      });
    }
    else{
      Logs.LogErrorIP(req, "403", "EncyptAll : wait 2 minutes before encrypt again");
      res.status(403).json({ error: "EncryptAll: wait 2 minutes" });
    }
  }
};

async function encryptAdmin(admins) {
  return models.sequelize
    .transaction(function(t) {
      let promises = [];
      for (let i = 0; i < admins.length; i++) {
        const mail = admins[i].email;
        const newPromise = models.Admin.update(
          {
            email: admins[i].email,
            firstname: admins[i].firstname,
            lastname: admins[i].lastname
          },
          { where: { email: mail } },
          { transaction: t }
        );
        promises.push(newPromise);
      }
      return Promise.all(promises);
    })
    .catch(function(err) {
      return Logs.LogError(500, "Error encryptSession: " + err);
    });
}

async function encryptPro(pros) {
  return models.sequelize
    .transaction(function(t) {
      let promises = [];
      for (let i = 0; i < pros.length; i++) {
        const mail = pros[i].email;
        const newPromise = models.Pro.update(
          {
            email: pros[i].email,
            firstname: pros[i].firstname,
            lastname: pros[i].lastname,
            adeli: pros[i].adeli,
            phone: pros[i].phone
          },
          { where: { email: mail } },
          { transaction: t }
        );
        promises.push(newPromise);
      }
      return Promise.all(promises);
    })
    .catch(function(err) {
      return Logs.LogError(500, "Error encryptSession: " + err);
    });
}

async function encryptPatient(patients) {
  return models.sequelize
    .transaction(function(t) {
      let promises = [];
      for (let i = 0; i < patients.length; i++) {
        const mail = patients[i].email;
        const newPromise = models.Patient.update(
          {
            email: patients[i].email,
            firstname: patients[i].firstname,
            lastname: patients[i].lastname
          },
          { where: { email: mail } },
          { transaction: t }
        );
        promises.push(newPromise);
      }
      return Promise.all(promises);
    })
    .catch(function(err) {
      return Logs.LogError(500, "Error encryptSession: " + err);
    });
}

async function encryptDiary(diaries) {
  return models.sequelize
    .transaction(function(t) {
      let promises = [];
      for (let i = 0; i < diaries.length; i++) {
        const id = diaries[i].id;
        const newPromise = models.Diary.update(
          {
            content: diaries[i].content
          },
          { where: { id: id } },
          { transaction: t }
        );
        promises.push(newPromise);
      }
      return Promise.all(promises);
    })
    .catch(function(err) {
      return Logs.LogError(500, "Error encryptSession: " + err);
    });
}

async function encryptReport(diaries) {
  return models.sequelize
    .transaction(function(t) {
      let promises = [];
      for (let i = 0; i < diaries.length; i++) {
        const id = diaries[i].id;
        const newPromise = models.Report_pro.update(
          {
            content: diaries[i].content
          },
          { where: { id: id } },
          { transaction: t }
        );
        promises.push(newPromise);
      }
      return Promise.all(promises);
    })
    .catch(function(err) {
      return Logs.LogError(500, "Error encryptSession: " + err);
    });
}

async function encryptSession(sessions) {
  return models.sequelize
    .transaction(function(t) {
      let promises = [];
      for (let i = 0; i < sessions.length; i++) {
        const id = sessions[i].id;
        const newPromise = models.Sessions.update(
          {
            text_situation: sessions[i].text_situation,
            text_mood: sessions[i].text_mood,
            text_automatic: sessions[i].text_automatic,
            text_rational: sessions[i].text_rational,
            text_result: sessions[i].text_result
          },
          { where: { id: id } },
          { transaction: t }
        );
        promises.push(newPromise);
      }
      return Promise.all(promises);
    })
    .catch(function(err) {
      return Logs.LogError(500, "Error encryptSession: " + err);
    });
}
