var bcrypt = require("bcrypt");
var jwtUtils = require('../../../utils/jwt.utils');
var models = require("../../../models/index");
const debug = require("debug")("app:reports.controller");
var verifPro = require("../../../utils/pro_sub.utils");
var Stats = require('../../../utils/statistics');
var Logs = require('../../../utils/file_log_system');
const sequelize = require("sequelize");

//routes
module.exports = {
    getReportsByPro: function(req, res, next) {
        debug("getReportsByPro");

        Stats.UpdateRequestStat("Pro");
        return models.Followup.findAll({
            where: {pro_id: req.params.id, is_active: true
        },
            }).then(followups => {
                let reports_list = [];
                for (let i = 0; i < followups.length; i++) {
                    models.Report_pro.findAll(
                    {
                        where: {pro_id: req.params.id, patient_id: followups[i].patient_id},
                        attributes: ['creation_date', 'reporting_date', 'content', 'id'],
                        include: [{
                            model: models.Patient,
                            attributes: {exclude: ['password']}
                        }]
                    },)
                    .then(function (reports) {
                        for (let j = 0; j < reports.length; j++) {
                            reports_list.push(reports[j])
                        }
                        if (i + 1 >= followups.length) {
                            Logs.LogSuccessIP(req, 200, "getReportsByPro : success");
                            return res.json(reports_list)
                        }
                    })
                    .catch(next);
                }
            })
    },
    getReportById: function(req, res, next) {
        debug("getReportById");

        Stats.UpdateRequestStat("Pro");
        return models.Report_pro.findById(req.params.id, {
                attributes: ['creation_date', 'reporting_date', 'content', 'id'],
                include: [{
                    model: models.Patient,
                    attributes: {exclude: ['password']}
                }]
            }
        )
        .then(function(report) {
            Logs.LogSuccessIP(req, 200, "getReportById : success");
            return res.json(report); })
        .catch(next);
    },
    getReportsByPatient: function(req, res, next) {
        debug("getReportsByPatient");

        Stats.UpdateRequestStat("Pro");
        return models.Report_pro.findAll(
            {
                where: {patient_id: req.params.id},
                attributes: ['creation_date', 'reporting_date', 'content', 'id'],
                include: [{
                    model: models.Patient,
                    attributes: {exclude: ['password']}
                }]
            }
        )
        .then(function(reports) {
            Logs.LogSuccessIP(req, 200, "getReportsByPatient : success");
            return res.json(reports); })
        .catch(next);
    },
    create: function(req, res, next) {
        debug("create");

        Stats.UpdateRequestStat("Pro");
        return Promise.resolve()
        .then(createReport)
        .then((followup) => {
            Logs.LogSuccessIP(req, 200, "createReport : success");
            res.json(followup)})
        .catch(next);

        function createReport() {
            return models.Report_pro.create({
                reporting_date: req.body.date,
                patient_id: req.body.patient_id,
                pro_id: req.body.pro_id,
                content: req.body.content
            })
        }
    },
    update: function(req, res, next) {
        debug("update");

        Stats.UpdateRequestStat("Pro");
        return Promise.resolve()
        .then(updateReport)
        .then((report) => {
            Logs.LogSuccessIP(req, 200, "updateReport : success");
            res.json(report)})
        .catch(next);


        function updateReport() {
            return models.Report_pro.update({content: req.body.content}, { where: {id: req.body.id} });
        }
    },

    delete: function(req, res, next) {
        debug("delete");

        Stats.UpdateRequestStat("Pro");
        return Promise.resolve()
        .then(deleteReport)
            .then(function () {
                Logs.LogSuccessIP(req, 200, "deleteReport : success");
                return res.status(200).json({ok:true});
            })
            .catch(function (err) {
                console.log("Error remove objective");
                console.log("Log : " + err);
                Logs.LogError(500, "deleteReport : "+ err)
                return res
                    .status(500)
                    .json({error: "cannot remove objective"});
            });


        function deleteReport() {
            return models.Report_pro.destroy({where: {id: req.params.id}})
        }
    }

};
