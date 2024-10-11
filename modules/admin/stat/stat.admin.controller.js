var jwtUtils = require('../../../utils/jwt.utils');
var Logs = require('../../../utils/file_log_system');
var models = require("../../../models/index");
var Stats = require('../../../utils/statistics');
var moment = require("moment");

//routes
module.exports = {
    getAllStat: function (req, res) {
        var headerAuth = req.headers['authorization'];
        var adminId = jwtUtils.getAdminId(headerAuth, 1);
        if (adminId < 0) {
            Logs.LogErrorIP(req, '401', "GetAdminData : wrong token");
            return res.status(401).json({ 'error': 'wrong token' });
        }
        //date : yyyy-mm-dd_yyyy-mm-dd (from-to)
        var dateParse = req.params.date.split("_");
        var dateFrom = dateParse[0];
        var dateTo = dateParse[1];
        Stats.UpdateRequestStat("Admin").then(function () {
            Stats.GetStatAPIFromDate(dateFrom).then(function (statAPIFrom) {
                Stats.GetStatPatientFromDate(dateFrom).then(function (statPatientFrom) {
                    Stats.GetStatProFromDate(dateFrom).then(function (statProFrom) {
                        var resultFrom = {
                            'API': statAPIFrom,
                            'Patient': statPatientFrom,
                            'Pro': statProFrom,
                        };
                        if (resultFrom.API && resultFrom.Patient && resultFrom.Pro) {
                            if (dateTo) {
                                dateTo = dateParse[1];
                                Stats.GetStatAPIFromDate(dateTo).then(function (statAPITo) {
                                    Stats.GetStatPatientFromDate(dateTo).then(function (statPatientTo) {
                                        Stats.GetStatProFromDate(dateTo).then(function (statProTo) {
                                            var resultTo = {
                                                'API': statAPITo,
                                                'Patient': statPatientTo,
                                                'Pro': statProTo,
                                            };
                                            if (resultTo.API && resultTo.Patient && resultTo.Pro) {
                                                var result = {
                                                    'Form': 2,
                                                    'From': resultFrom,
                                                    'To': resultTo
                                                };
                                                return res.status(200).json(result);
                                            }
                                            else {
                                                Logs.LogError(500, "getAllStat: Error with resultTo");
                                                return res.status(500).json({ 'error': "getAllStat: Error with resultTo" });
                                            }
                                        });
                                    });
                                });
                            }
                            else {
                                var result = {
                                    'Form': 1,
                                    'From': resultFrom
                                };
                                return res.status(200).json(result);
                            }
                        }
                        else {
                            Logs.LogError(500, "getAllStat: Error with resultFrom");
                            return res.status(500).json({ 'error': "getAllStat: Error with resultFrom" });
                        }
                    });
                });
            });
        });
    },
    getExportStat: function (req, res) {
        var headerAuth = req.headers['authorization'];
        var adminId = jwtUtils.getAdminId(headerAuth, 1);
        if (adminId < 0) {
            Logs.LogErrorIP(req, '401', "GetAdminData : wrong token");
            return res.status(401).json({ 'error': 'wrong token' });
        }
        //date : yyyy-mm-dd_yyyy-mm-dd (from-to)
        var dateParse = req.params.date.split("_");
        var dateFrom = dateParse[0];
        var dateTo = dateParse[1];
        Stats.UpdateRequestStat("Admin").then(function () {
            var interval = getDates(new Date(dateFrom), new Date(dateTo));
            return Stats.GetIntervalStatAPIFromDate(dateFrom, dateTo).then(function (statsAPI) {
                return Stats.GetIntervalStatPatientFromDate(dateFrom, dateTo).then(function (statsPatient) {
                    return Stats.GetIntervalStatProFromDate(dateFrom, dateTo).then(function (statsPro) {
                        var response = {};
                        interval.forEach(date => {
                            formDate = moment(date).format("YYYY-MM-DD");
                            var statAPI = statsAPI[formDate];
                            var statPatient = statsPatient[formDate];
                            var statPro = statsPro[formDate];
                            if (statPro ||statPatient || statAPI)
                                response[formDate] = {};
                            if (statPro) {
                                response[formDate]['nb_pro'] = statPro.nb_pro;
                                response[formDate]['nb_seance'] = statPro.nb_seance;
                                response[formDate]['nb_rapport'] = statPro.nb_rapport;
                                response[formDate]['patient_average'] = statPro.patient_average;
                            }
                            if (statPatient) {
                                response[formDate]['nb_patient'] = statPatient.nb_patient;
                                response[formDate]['time_average_app'] = statPatient.time_average_app;
                            }
                            if (statAPI) {
                                response[formDate]['total_nb_req'] = statAPI.total_nb_req;
                                response[formDate]['total_nb_errors'] = statAPI.total_nb_errors;
                                if (statAPI.Pro)
                                    response[formDate]['Pro'] = statAPI.Pro;
                                if (statAPI.Patient)
                                    response[formDate]['Patient'] = statAPI.Patient;
                                if (statAPI.Admin)
                                    response[formDate]['API'] = statAPI.Admin;
                            }
                        });
                        return res.status(200).json(response);
                    });
                });
            });
        });
    }
};

Date.prototype.addDays = function (days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

function getDates(startDate, stopDate) {
    var dateArray = new Array();
    var currentDate = startDate;
    while (currentDate <= stopDate.addDays(1)) {
        dateArray.push(new Date(currentDate));
        currentDate = currentDate.addDays(1);
    }
    return dateArray;
}