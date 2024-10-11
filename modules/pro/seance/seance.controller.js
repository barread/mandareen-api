var bcrypt = require("bcrypt");
var jwtUtils = require('../../../utils/jwt.utils');
var models = require("../../../models/index");
const debug = require("debug")("app:sub.controller");
var Logs = require('../../../utils/file_log_system');
var moment = require('moment');
var Stats = require('../../../utils/statistics');

//routes
module.exports = {
    getSeanceData: function (req, res, next) {
        debug("getSeanceData");

        Stats.UpdateRequestStat("Pro");
        listSeanceData = [];
        return models.Followup.findAll(
            {
                where: { pro_id: req.params.id, is_active: true },
                attributes: ['patient_id'],
            }
        )
            .then(function (listPatient) {
                var listSeanceData = [];
                var finish = 0;
                if (listPatient) {
                    for (var i = 0; i < listPatient.length; i++) {
                        models.Sessions.findAll({
                            where: { patient_id: listPatient[i].patient_id }
                        })
                            .then(listSeance => {
                                debug(listSeance);
                                if (listSeance.length != 0) {
                                    for (let i = 0; i < listSeance.length; i++)
                                        listSeanceData.push(listSeance[i]);
                                }
                                finish++;
                                if (finish == listPatient.length)
                                    return sendSeanceData(listSeanceData, req, res);
                            })
                    }

                } else {
                    Logs.LogError('404', "SeanceData: no sub for pro id");
                    return (res.status(500).json({ 'error': 'SeanceData for pro id not found' }));
                }
            }
            )
            .catch(function (err) {
                Logs.LogError('500', "SeanceData get : " + err);
                return (res.status(500).json({ 'error': 'SeanceData get failed' }));
            });

        function sendSeanceData(seanceData, req, res) {
            Logs.LogSuccessIP(req, '200', 'SeanceData get processed');
            return res.status(200).json(seanceData);
        }
    },

    getSesanceDataByPatient: function(req, res, next) {
        debug("getSeancedataByPatient");

        Stats.UpdateRequestStat("Pro");
        return models.Sessions.findAll(
            {
                where: {patient_id: req.params.id},
            }
        )
            .then(function(reports) {
                Logs.LogSuccessIP(req, 200, "getSessionsByPatient : success");
                return res.json(reports); })
            .catch(next);
    },

    getSesanceDataByid: function(req, res, next) {
        debug("getSeancedataById");

        Stats.UpdateRequestStat("Pro");
        return models.Sessions.findAll(
            {
                where: {id: req.params.id},
            }
        )
            .then(function(reports) {
                Logs.LogSuccessIP(req, 200, "getSessionsById : success");
                return res.json(reports[0]); })
            .catch(next);
    },

    getSesanceMoodsBySessionid: function(req, res, next) {
        debug("getSeanceMoodsBySessionId");

        Stats.UpdateRequestStat("Pro");
        return models.Session_moods.findAll(
            {
                where: {sessions_id: req.params.id},
            }
        )
            .then(function(moods) {
                Logs.LogSuccessIP(req, 200, "getSessionsById : success");
                return res.json(moods); })
            .catch(next);
    },

    deleteSeanceData: function (req, res, next) {
        debug("DeleteSeanceData");

        Stats.UpdateRequestStat("Pro");
        seanceId = req.params.id;
        console.log(seanceId);


        return models.Sessions.destroy({
            where: {
                id: seanceId
            }
        })
            .then(function () {
                debug("Removed session " + seanceId + " from session list");
                Logs.LogSuccessIP(req, 200, "deleteSeanceData : success");
                return res.status(200).json("Removed from seance list");
            })
            .catch(function (err) {
                console.log("Can't delete session " + seanceId);
                console.log("Log : " + err);
                Logs.LogError('500', "deleteSeanceData : " + err);
                return res.status(500).json({ error: "Can't delete this session" });
            });
    }

}


;
