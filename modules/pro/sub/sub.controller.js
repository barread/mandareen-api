var bcrypt = require("bcrypt");
var jwtUtils = require('../../../utils/jwt.utils');
var models = require("../../../models/index");
const debug = require("debug")("app:sub.controller");
var Logs = require('../../../utils/file_log_system');
var moment = require('moment');
var mailManager = require("../../../utils/mail_sender");
var Stats = require('../../../utils/statistics');
var proSub = require('../../../utils/pro_sub.utils')
const Op = require("sequelize").Op;

//routes
module.exports = {
    getCurrentSub: function (req, res, next) {
        debug("getCurrentSub");

        Stats.UpdateRequestStat("Pro");
        return models.Subs_pro.findAll(
            {
                where: { pro_id: req.params.id },
                attributes: ['sub_id', 'pending', 'date_sub_end']
            }
        )
            .then(function (CurrSub) {
                date = new Date();
                finded = false;
                for (let i = 0; i < CurrSub.length; i++) {
                    if (new Date(CurrSub[i].date_sub_end) > date && CurrSub[i].pending === "No" && !finded) {
                        finded = true;
                        models.Subscription.findOne({
                            where: { id: CurrSub[i].sub_id },
                            attributes: ['name', 'max_patients', 'price']
                        })
                            .then(function (Sub) {
                                Logs.LogSuccessIP(req, '200', 'Sub get processed');
                                return res.status(200).json({
                                    'name': Sub.name,
                                    'max_patients': Sub.max_patients,
                                    'pending': CurrSub[i].pending,
                                    'end': CurrSub[i].date_sub_end,
                                    'price': Sub.price
                                })
                            })
                            .catch(function (err) {
                                Logs.LogError('500', "Sub get : " + err);
                                return (res.status(500).json({ 'error': 'Sub get failed' }));
                            });
                    }
                    else if (new Date(CurrSub[i].date_sub_end) > date && CurrSub[i].pending === "Yes" && !finded) {
                        finded = true;
                        models.Subscription.findOne({
                            where: { id: CurrSub[i].sub_id },
                            attributes: ['name', 'max_patients', 'price']
                        })
                            .then(function (Sub) {
                                Logs.LogSuccessIP(req, '200', 'Sub get processed');
                                return res.status(200).json({
                                    'name': Sub.name,
                                    'max_patients': Sub.max_patients,
                                    'pending': CurrSub[i].pending,
                                    'end': CurrSub[i].date_sub_end,
                                    'price': Sub.price
                                })
                            })
                            .catch(function (err) {
                                Logs.LogError('500', "Sub get : " + err);
                                return (res.status(500).json({ 'error': 'Sub get failed' }));
                            });
                    }
                }
                if (!finded) {
                    Logs.LogError('404', "Sub: no sub for pro id");
                    return (res.status(500).json({ 'error': 'Sub for pro id not found' }));
                }
            }
            )
    },
    payCurrentSub: function (req, res, next) {
        debug("payCurrentSub");

        return models.Subs_pro.update({ 'pending': 'No' },
            {
                where: { pro_id: req.body.pro_id, date_sub_end: { $gt: new Date() } },
                attributes: ['id', 'sub_id', 'pending', 'date_sub_end']
            }
        )
            .then((sub) => {
                models.Pro.findOne({
                    where: { id: req.body.pro_id }
                }).then((pro) => {
                    models.Subs_pro.findOne({
                        where: { pro_id: req.body.pro_id, date_sub_end: { $gt: new Date() } }
                    }).then(subModel => {
                        mailManager.ActivateSubMail(pro);
                        proSub.filldocx(req, subModel, pro);
                    });
                });
                return res.status(200).json({ 'status': 'Sub request ok' })
            });
    },
    postRequestSub: function (req, res, next) {
        debug("request sub");
        Stats.UpdateRequestStat("Pro");
        models.Pro.findOne({
            where: { id: req.body.id }
        }).then(function (pro) {
            date = new Date();
            models.Subs_pro.findAll({
                where: { pro_id: req.body.id }
            }).then(function (sub) {
                already = false;
                for (let i = 0; i < sub.length; i++) {
                    if (new Date(sub[i].date_sub_end) > date) {
                        already = true;
                        Logs.LogErrorIP(req, '409', "Request Sub : Already exist");
                        return res.status(409).json({ 'error': 'sub already set, use replace instead' });
                    }
                }
                if (!already) {
                    models.Subscription.findOne({
                        where: { name: req.body.sub_name }
                    }).then(function (sub) {
                        if (sub) {
                            var NewSub = models.Subs_pro.create({
                                pro_id: req.body.id,
                                sub_id: sub.id,
                                date_sub_start: moment().format("YYYY-MM-DD"),
                                date_sub_end: moment().add(parseInt(req.body.duration), 'months').format("YYYY-MM-DD")
                            })
                                .then(function (NewSub) {
                                    mailManager.NewSubMail(sub.name, pro);
                                    Logs.LogSuccessIP(req, '200', 'Sub request processed');
                                    return res.status(200).json({ 'status': 'Sub request ok' })
                                })
                                .catch(function (err) {
                                    Logs.LogError('500', "Sub request : " + err);
                                    return (res.status(500).json({ 'error': 'Sub request failed' }));
                                });
                        }
                        else {
                            Logs.LogErrorIP(req, '404', "Request Sub : sub don't exist on db");
                            return res.status(409).json({ 'error': "Request Sub : sub don't exist on db" });
                        }
                    })
                }
            })
        }
        ).catch(function (err) {
            Logs.LogError('500', "request sub : " + err);
            return res.status(500).json({ 'error': 'cannot request subscription' });
        });
    },
    getSubList: function (req, res, next) {
        debug("getSubList");

        Stats.UpdateRequestStat("Pro");
        models.Subscription.findAll({
            attributes: { exclude: ['id', 'creation_date'] },
            order: [['price', "ASC"]],
            where: {
                price: {
                  [Op.gt]: 0
                }
              }})
            .then(function (subList) {
                Logs.LogSuccessIP(req, '200', 'Sub List processed');
                return res.status(200).json(subList);
            })
            .catch(function (err) {
                Logs.LogErrorIP(req, '404', 'Sub list not found: ' + err);
                return res.status(404).json({ 'Error': "Something went wrong when looking for subscription list" });
            })
    },

};