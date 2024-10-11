var bcrypt = require("bcrypt");
var jwtUtils = require('../../../utils/jwt.utils');
var models = require("../../../models/index");
const debug = require("debug")("app:bug-system.controller");
var Twig = require("twig");
var mailer = require("nodemailer");
var Logs = require('../../../utils/file_log_system');
var moment = require('moment');
var fs = require('fs');
var Stats = require('../../../utils/statistics');

//routes
module.exports = {
    send: function(req, res, next) {
        debug("send");

        Stats.UpdateRequestStat("Pro");
        if(req.body.id == null) {
            Logs.LogError('400', "Send pro bug report : missing parameters");
            return res.status(400).json({'error': 'missing parameters'});
        }
        try {
            var contents = fs.readFileSync('ressources/mails/bug_report/pro-report.txt.twig' , 'utf8');
        }
        catch (err)
        {
            Logs.LogError("500", "GetLogsFromDate : " + err);
        }
        models.Pro.findOne({
            attributes: ['id', 'email', 'civ', 'firstname', 'lastname'],
            where: {id: req.body.id}
        })
        .then(function(ProFound) {
            if(ProFound) {
                var mail = Twig.twig({data: contents, async: false}).render({
                    nom: ProFound.civ + " " + ProFound.lastname.toUpperCase() + " " + ProFound.firstname,
                    email: ProFound.email,
                    explication: req.body.explain,
                    cheminement: req.body.cheminement,
                    date: moment().format("DD-MM-YYYY HH:mm")
                });
                var mailTo = ProFound.email;
                var transporter = mailer.createTransport({
                    service: 'Gmail',
                    auth: {
                        user: 'contact.mandareen@gmail.com',
                        pass: '20ManDa1reEn8'
                    },
                    tls: {
                        rejectUnauthorized: false
                    }
                });
                var mail = {
                    from: "contact.mandareen@gmail.com",
                    to: 'contact.mandareen@gmail.com',
                    subject: "[No-Reply] Bug Report - PRO",
                    html: mail
                }
                transporter.sendMail(mail, function(error, response) {
                    if (error) {
                        state = "err";
                        Logs.LogError('500', "Send pro bug report : " + err);
                        return res.status(500).json({"error": "Send mail failed"});
                    }
                    else {
                        state = "ok"
                        return res.status(200).json({'message': "email send"});
                    }
                })
                }
            else {
                Logs.LogError('500', "Send pro bug report : " + err);
                return res.status(404).json({'error': 'pro not exist in DB'});
            }
        })
        .catch(function(err) {
            Logs.LogError('500', "Send pro bug report : " + err);
            return res.status(500).json({'error': 'unable to verify pro'});
        });
    },

    send_contact: function(req, res, next) {
        debug("send");


        if(req.body.id == null) {
            Logs.LogError('400', "Send Contact from Pro : missing parameters");
            return res.status(400).json({'error': 'missing parameters'});
        }
        try {
            var contents = fs.readFileSync('ressources/mails/bug_report/pro-contact.txt.twig' , 'utf8');
        }
        catch (err)
        {
            Logs.LogError("500", "GetLogsFromDate : " + err);
        }
        models.Pro.findOne({
            attributes: ['id', 'email', 'civ', 'firstname', 'lastname'],
            where: {id: req.body.id}
        })
            .then(function(ProFound) {
                if(ProFound) {
                    var mail = Twig.twig({data: contents, async: false}).render({
                        nom: ProFound.civ + " " + ProFound.lastname.toUpperCase() + " " + ProFound.firstname,
                        email: ProFound.email,
                        object: req.body.object,
                        message: req.body.message,
                        date: moment().format("DD-MM-YYYY HH:mm")
                    });
                    var mailTo = ProFound.email;
                    var transporter = mailer.createTransport({
                        service: 'Gmail',
                        auth: {
                            user: 'contact.mandareen@gmail.com',
                            pass: '20ManDa1reEn8'
                        },
                        tls: {
                            rejectUnauthorized: false
                        }
                    });
                    var mail = {
                        from: "contact.mandareen@gmail.com",
                        to: 'contact.mandareen@gmail.com',
                        subject: "[No-Reply] Contact - PRO",
                        html: mail
                    }
                    transporter.sendMail(mail, function(error, response) {
                        if (error) {
                            state = "err";
                            Logs.LogError('500', "Send contact from pro : " + err);
                            return res.status(500).json({"error": "Send mail failed"});
                        }
                        else {
                            state = "ok"
                            return res.status(200).json({'message': "email send"});
                        }
                    })
                }
                else {
                    Logs.LogError('500', "Send contact from pro : " + err);
                    return res.status(404).json({'error': 'pro not exist in DB'});
                }
            })
            .catch(function(err) {
                Logs.LogError('500', "Send contact from pro : " + err);
                return res.status(500).json({'error': 'unable to verify pro'});
            });
    },
};
