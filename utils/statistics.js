var models = require("../models/index");
var moment = require("moment");
var fs = require('fs');

module.exports = {
    UpdateRequestStat: function (interface) {
        var now = moment().format("YYYY-MM-DD");
        return module.exports.UpdateStats().then(function (stats) {
            if (stats) {
                return stats.update({ 'total_nb_req': stats.total_nb_req + 1 }).then(function (newStats) {
                    return models.StatsRequests.findOne({
                        where: {
                            'cutoff_date': now,
                            'interface': interface
                        }
                    }).then(function (StatNow) {
                        var data = {
                            'global_stats_id': newStats.id,
                            'total_nb_req': 1,
                            'interface': interface
                        };
                        if (StatNow) {
                            data.total_nb_req = StatNow.total_nb_req + 1;
                            var log = StatNow.update(data);
                            return log;
                        }
                        else {
                            data = {
                                'global_stats_id': newStats.id,
                                'total_nb_req': 1,
                                'interface': interface,
                                'cutoff_date': now
                            };
                            var log = models.StatsRequests.create(data);
                            return log;
                        }
                    }).catch(function (err) {
                        LogError('500', "UpdateRequestStat : " + err);
                    });
                }).catch(function (err) {
                    LogError('500', "UpdateRequestStat : " + err);
                });
            }
        }).catch(function (err) {
            LogError('500', "UpdateRequestStat : " + err);
        });
    },
    UpdateErrorStat: function () {
        return module.exports.UpdateStats().then(function (stats) {
            if (stats) {
                var data = {
                    'total_nb_errors': stats.total_nb_errors + 1
                };
                return stats.update(data);
            }
        }).catch(function (err) {
            LogError('500', "UpdateErrorStat : " + err);
        });
    },
    UpdateStats: function () {
        var now = moment().format("YYYY-MM-DD");
        return module.exports.GetUpdateStatPro().then(function (pro_stats) {
            return module.exports.GetUpdateStatPatient().then(function (patient_stats) {
                var data = {
                    'nb_pro': pro_stats.nb_pro,
                    'nb_seance': pro_stats.nb_seance,
                    'nb_rapport': pro_stats.nb_rapport,
                    'pat_average': pro_stats.pat_average,
                    'nb_patient': patient_stats.nb_patient,
                    'time_average': patient_stats.time_average,
                };
                return models.GlobalStats.findOne({
                    where: { 'cutoff_date': now }
                }).then(function (StatNow) {
                    if (StatNow) {
                        var log = StatNow.update(data);
                        return log;
                    }
                    else {
                        data = {
                            'nb_pro': pro_stats.nb_pro,
                            'nb_seance': pro_stats.nb_seance,
                            'nb_rapport': pro_stats.nb_rapport,
                            'pat_average': pro_stats.pat_average,
                            'nb_patient': patient_stats.nb_patient,
                            'time_average': patient_stats.time_average,
                            'cutoff_date': now
                        };
                        var log = models.GlobalStats.create(data);
                        return log;
                    }
                }).catch(function (err) {
                    LogError('500', "UpdateStats : " + err);
                });
            }).catch(function (err) {
                LogError('500', "UpdateStats : " + err);
            });
        });
    },
    GetUpdateStatPro: function () {
        return models.Pro.findAll({
            attributes: ['id'], raw: true
        }).then(function (pros) {
            if (pros) {
                nb_pro = 0;
                pros.forEach(elem => {
                    nb_pro++;
                });
                var nb_seance = 0;
                var nb_rapport = 0;
                var avg_patient = 0.0;
                return models.Report_pro.findAll({
                    attributes: ['id']
                }).then(function (reports) {
                    if (reports) {
                        nb_rapport = 0;
                        reports.forEach(elem => {
                            nb_rapport++;
                        });
                    }
                    return models.Sessions.findAll({
                        attributes: ['id']
                    }).then(function (seances) {
                        if (seances) {
                            nb_seance = 0;
                            seances.forEach(elem => {
                                nb_seance++;
                            });
                        }
                        return models.Patient.findAll({
                            attributes: ['id']
                        }).then(function (patients) {
                            var nb_pat = 0;
                            patients.forEach(elem => {
                                nb_pat++;
                            });
                            if (patients) {
                                avg_patient = nb_pat / nb_pro;
                            }
                            var values = {
                                'nb_pro': nb_pro,
                                'nb_seance': nb_seance,
                                'nb_rapport': nb_rapport,
                                'pat_average': avg_patient
                            };
                            return values;
                        });
                    }).catch(function (err) {
                        LogError('500', "GetUpdateStatPro : " + err);
                    });
                }).catch(function (err) {
                    LogError('500', "GetUpdateStatPro : " + err);
                });
            }
            else {
                LogErrorIP(req, "404", "GetUpdateStatPro : pros not found");
            }
        }).catch(function (err) {
            LogError('500', "GetUpdateStatPro : " + err);
        });
    },
    GetUpdateStatPatient: function () {
        var nb_patient = 0;
        var time_average = 0;
        return models.Patient.findAll({
            attributes: ['id']
        }).then(function (patients) {
            nb_patient = 0;
            patients.forEach(elem => {
                nb_patient++;
            });
            return models.Stats.findAll({
                attributes: ['app_time']
            }).then(function (stats) {
                var timeSec = 0;
                if (stats) {
                    stats.forEach(element => {
                        var NewTimeSec = 0;
                        var a = element.app_time.split(':');
                        var seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]);
                        timeSec += seconds;
                    });
                    time_average = timeSec / nb_patient;
                    var sec = parseInt(time_average % 60);
                    var min = time_average / 60;
                    var hour = parseInt(min / 60);
                    min = parseInt(min % 60);
                    var values2 = {
                        'nb_patient': nb_patient,
                        'time_average': hour + ":" + moment(min + ":" + sec, "mm:ss").format("mm:ss"),
                    };
                    return values2;
                }
            }).catch(function (err) {
                LogError('500', "GetUpdateStatPatient : " + err);
            });
        }).catch(function (err) {
            LogError('500', "GetUpdateStatPatient : " + err);
        });
    },
    GetStatPatientFromDate: function (date) {
        return models.GlobalStats.findOne({ where: { 'cutoff_date': date } }).then(function (stats) {
            if (stats) {
                var result = {
                    'nb_patient': stats.nb_patient,
                    'time_average': stats.time_average,
                    'cutoff_date': stats.cutoff_date,
                }
                return result;
            }
        }).catch(function (e) {
            LogError('500', "GetStatPatientFromDate : " + e);
        });
    },
    GetIntervalStatPatientFromDate: function (dateFrom, dateTo) {
        return models.GlobalStats.findAll({ where: { 'cutoff_date': { $between: [dateFrom, dateTo] } } }).then(function (stats) {
            if (stats) {
                var result = {};
                stats.forEach(stat => {
                    result[stat.cutoff_date] = {};
                    result[stat.cutoff_date]["date"] = stat.cutoff_date;
                    result[stat.cutoff_date]["nb_patient"] = stat.nb_patient;
                    result[stat.cutoff_date]["time_average_app"] = stat.time_average;
                });
                return result;
            }
        }).catch(function (e) {
            LogError('500', "GetIntervalStatPatientFromDate : " + e);
        });
    },
    GetStatProFromDate: function (date) {
        return models.GlobalStats.findOne({ where: { 'cutoff_date': date } }).then(function (stats) {
            if (stats) {
                var result = {
                    'nb_pro': stats.nb_pro,
                    'nb_seance': stats.nb_seance,
                    'nb_rapport': stats.nb_rapport,
                    'pat_average': stats.pat_average,
                    'cutoff_date': stats.cutoff_date,
                }
                return result
            }
        }).catch(function (e) {
            LogError(500, "GetStatProFromDate: " + e)
        });
    },
    GetIntervalStatProFromDate: function (dateFrom, dateTo) {
        return models.GlobalStats.findAll({ where: { 'cutoff_date': { $between: [dateFrom, dateTo] } } }).then(function (stats) {
            if (stats) {
                var result = {};
                stats.forEach(stat => {
                    result[stat.cutoff_date] = {};
                    result[stat.cutoff_date]["date"] = stat.cutoff_date;
                    result[stat.cutoff_date]["patient_average"] = stat.pat_average;
                    result[stat.cutoff_date]["nb_pro"] = stat.nb_pro;
                    result[stat.cutoff_date]["nb_seance"] = stat.nb_seance;
                    result[stat.cutoff_date]["nb_rapport"] = stat.nb_rapport;
                });
                return result
            }
        }).catch(function (e) {
            LogError(500, "GetStatProFromDate: " + e)
        });
    },
    GetStatAPIFromDate: function (date) {
        return models.GlobalStats.findOne({ where: { 'cutoff_date': date } }).then(function (stats) {
            if (stats) {
                return models.StatsRequests.findAll({ where: { 'cutoff_date': date } }).then(function (statsReq) {
                    var result = {
                        'total_nb_req': stats.total_nb_req,
                        'total_nb_errors': stats.total_nb_errors,
                    }
                    statsReq.forEach(element => {
                        result[element.interface] = element.total_nb_req;
                    });
                    return result;
                }).catch(function (e) {
                    LogError('500', "GetStatAPIFromDate : " + e);
                });
            }
        }).catch(function (e) {
            LogError('500', "GetStatAPIFromDate : " + e);
        });
    },
    GetIntervalStatAPIFromDate: function (dateFrom, dateTo) {
        return models.GlobalStats.findAll({ where: { 'cutoff_date': { $between: [dateFrom, dateTo] } } }).then(function (stats) {
            if (stats) {
                return models.StatsRequests.findAll({ where: { 'cutoff_date': { $between: [dateFrom, dateTo] } } }).then(function (statsReq) {
                    var result = {};
                    stats.forEach(stat => {
                        result[stat.cutoff_date] = {};
                        result[stat.cutoff_date]['cutoff_date'] = stat.cutoff_date;
                        result[stat.cutoff_date]['total_nb_req'] = stat.total_nb_req;
                        result[stat.cutoff_date]['total_nb_errors'] = stat.total_nb_errors;
                        statsReq.forEach(element => {
                            if (element.cutoff_date == stat.cutoff_date)
                                result[stat.cutoff_date][element.interface] = element.total_nb_req;
                        });
                    });
                    return result;
                }).catch(function (e) {
                    LogError('500', "GetIntervalStatAPIFromDate : " + e);
                });
            }
        }).catch(function (e) {
            LogError('500', "GetIntervalStatAPIFromDate : " + e);
        });
    }
}

LogError = function (code, string) {
    module.exports.UpdateErrorStat().then(function () {
        var output = "";
        output = getDateLog();
        output += " | " + code + " | " + string;
        WriteInFile("./LogsAPI/ERROR.log", output);
        WriteInFile("./LogsAPI/logs_" + moment().format("MM-YYYY") + ".log", output);
    });
}


function getDateLog() {
    return (moment().format("DD/MM/YYYY | HH:mm:ss"))
}

function WriteInFile(path, output) {
    try { fs.mkdirSync("./LogsAPI") }
    catch (err) {
        if (err.code !== 'EEXIST')
            throw err
    }
    var options = { flags: 'a+' }
    var wstream = fs.createWriteStream(path, options);
    wstream.write(output + '\r\n');
    wstream.end();
}
