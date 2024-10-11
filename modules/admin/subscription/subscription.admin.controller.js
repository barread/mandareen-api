var jwtUtils = require('../../../utils/jwt.utils');
var Logs = require('../../../utils/file_log_system');
var models = require("../../../models/index");
var Stats = require('../../../utils/statistics');
var mailManager = require("../../../utils/mail_sender");

//routes
module.exports = {
    getAllSubs: function(req, res){
        var headerAuth = req.headers['authorization'];
        var adminId = jwtUtils.getAdminId(headerAuth, 1);
        Stats.UpdateRequestStat("Admin");

        if(adminId < 0) {
            Logs.LogErrorIP(req, "401", "getAllSubs : wrong token");
            return res.status(401).json({'error': 'wrong token'});
        }
        models.Subs_pro.findAll({
            attributes: ['id', 'pending', 'date_sub_start', 'date_sub_end'],
            include: [{
                model: models.Pro,
                attributes:['civ', 'firstname', 'lastname']
            },
        {
            model: models.Subscription,
            attributes:['name']
        }],
        }).then(function(subs) {
            if(subs) {
                Logs.LogSuccessIP(req, "200", "getAllSubs : ok");
                return res.status(200).json(subs);
            }
            else {
                Logs.LogErrorIP(req, "404", "getAllSubs : not found");
                return res.status(404).json({'error': 'Subs not found'});
            }
        }).catch(function(err) {
            Logs.LogError('500', "GetAllSubs : " + err);
            return res.status(500).json({'error': 'cannot fetch Subs data'});
        });
    },
    getAllSubsFilter: function(req, res){
        var headerAuth = req.headers['authorization'];
        var adminId = jwtUtils.getAdminId(headerAuth, 1);
        var filter = req.params.filter;
        Stats.UpdateRequestStat("Admin");

        if (!filter)
            filter = "";
        else if (filter != "Yes" && filter != "No")
            filter = "";

        if(adminId < 0) {
            Logs.LogErrorIP(req, "401", "getAllSubs : wrong token");
            return res.status(401).json({'error': 'wrong token'});
        }
        models.Subs_pro.findAll({
            attributes: ['id', 'pending', 'date_sub_start', 'date_sub_end'],
            where: {pending : filter},
            include: [{
                model: models.Pro,
                attributes:['civ', 'firstname', 'lastname']
            },
        {
            model: models.Subscription,
            attributes:['name']
        }],
        }).then(function(subs) {
            if(subs) {
                Logs.LogSuccessIP(req, "200", "getAllSubsFilter : ok");
                return res.status(200).json(subs);
            }
            else {
                Logs.LogErrorIP(req, "404", "getAllSubsFilter : not found");
                return res.status(404).json({'error': 'Subs not found'});
            }
        }).catch(function(err) {
            Logs.LogError('500', "GetAllSubsFilter : " + err);
            return res.status(500).json({'error': 'cannot fetch Subs data'});
        });
    },
    ToogleSub: function(req, res){
        Stats.UpdateRequestStat("Admin");
        var headerAuth = req.headers['authorization'];
        var adminId = jwtUtils.getAdminId(headerAuth, 1);

        if(adminId < 0) {
            Logs.LogErrorIP(req, "401", "ToogleSub : wrong token");
            return res.status(401).json({'error': 'wrong token'});
        }
        return models.Subs_pro.update({
                    pending : "No"
                }, {
                    where: {id: req.body.id}
                })
                    .then(function (result) {
                        return models.Pro.findOne({
                            where: {id: req.body.pro_id}
                        }).then((pro) => {
                            mailManager.ActivateSubMail(pro)
                            return res.json(result);
                        });
                    }).catch(function (err) {
                        Logs.LogError('Error updating sub' + err);
                        return (res.status(500).json({'Error': 'Cannot update sub'}));
                    });
    },
    DeleteSub: function(req, res){
        Stats.UpdateRequestStat("Admin");
        var headerAuth = req.headers['authorization'];
        var adminId = jwtUtils.getAdminId(headerAuth, 1);

        if(adminId < 0) {
            Logs.LogErrorIP(req, "401", "ToogleSub : wrong token");
            return res.status(401).json({'error': 'wrong token'});
        }
        return models.Admin.findOne({
            attributes: ['id', 'login', 'type'],
            where: {id: adminId}
        }).then(function(admin) {
            if(admin && admin.type == "Super-Admin") {
                return models.Subs_pro.destroy({
                    where: {id: req.body.id}
                }).then(function(rowDeleted) {
                        if (rowDeleted === 1){
                            Logs.LogSuccessIP(req, '200', 'Subscription deleted')
                            return res.status(200).json({'status': 'Subscription deleted'})
                        }
                });
            }
            else
            {
                return res.status(404).json({'error': 'Super-admin not found'})
            }
        });
    },

    //Ajout d'abonnement
    
    getSubList: function(req, res)
    {        
        Stats.UpdateRequestStat("Admin");
        models.Subscription.findAll({order: [
            ['max_patients', 'ASC'],
            ['price', 'ASC']
        ]})
            .then(function (subList){
                Logs.LogSuccessIP(req, '200', 'Sub List processed');
                return res.status(200).json(subList);
            })
            .catch( function(err)
                {
                    Logs.LogErrorIP('404', 'Sub list not found');
                    return res.status(404).json({'Error': "Something went wrong when looking for subscription list"});
                })
    },
    getSub: function(req, res)
    {        
        Stats.UpdateRequestStat("Admin");
        models.Subscription.findOne({
            where: {id: req.params.id}
        }).then(function (sub){
                Logs.LogSuccessIP(req, '200', 'Sub processed');
                return res.status(200).json(sub);
            })
            .catch( function(err)
                {
                    Logs.LogErrorIP('404', 'Sub : '+ err);
                    return res.status(404).json({'Error': "Something went wrong when looking for a subscription"});
                })
    },
    updateSub: function(req, res){
        Stats.UpdateRequestStat("Admin");
        var headerAuth = req.headers['authorization'];
        var adminId = jwtUtils.getAdminId(headerAuth, 1);
        var name = req.body.name;
        var price = req.body.price;
        var maxPat = req.body.patients;

        if(adminId < 0) {
            Logs.LogErrorIP(req, "401", "updateSub : wrong token");
            return res.status(401).json({'error': 'wrong token'});
        }
        return models.Subscription.update({
            name: name,
            price: price,
            max_patients: maxPat
        }, {
            where: {id: req.body.id}
        })
            .then(function (result) {
                Logs.LogSuccessIP(req, 200, "updateSub : success");
                return res.json(result);
            }).catch(function (err) {
                Logs.LogErrorIP(req, "500", "updateSub : " + err);
                return (res.status(500).json({'Error': 'Cannot update sub'}));
            });
    },
    createSub: function(req, res) {
        Stats.UpdateRequestStat("Admin");
        var headerAuth = req.headers['authorization'];
        var adminId = jwtUtils.getAdminId(headerAuth, 1);
        var name = req.body.name;
        var price = req.body.price;
        var maxPat = req.body.patients;

        if(adminId < 0) {
            Logs.LogErrorIP(req, "401", "updateSub : wrong token");
            return res.status(401).json({'error': 'wrong token'});
        }
        return models.Subscription.findOne({where: {name: name}}).then(function (sub) {
            if (sub){
                Logs.LogErrorIP(req, "409", "updateSub : sub name already used");
                return res.status(409).json({'error': 'sub name already used'});
            }
            else{
                return models.Subscription.create({
                    name: name,
                    price: price,
                    max_patients: maxPat
                }).then (function (newSub) {
                    Logs.LogSuccessIP(req, '200', 'Sub created');
                    return res.status(200).json(newSub);
                }).catch (function (e){
                    Logs.LogSuccessIP(req, '500', 'createSub : ' + e);
                    return res.status(500).json({error: "CreateSub : Can't create new sub"});
                });
            }
        }).catch(function (e){
            Logs.LogSuccessIP(req, '500', 'createSub : ' + e);
            return res.status(500).json({error: "CreateSub : Can't verify in DB"});
        });

    },
    deleteASub: function(req, res){
        Stats.UpdateRequestStat("Admin");
        var headerAuth = req.headers['authorization'];
        var adminId = jwtUtils.getAdminId(headerAuth, 1);

        if(adminId < 0) {
            Logs.LogErrorIP(req, "401", "ToogleSub : wrong token");
            return res.status(401).json({'error': 'wrong token'});
        }
        return models.Admin.findOne({
            attributes: ['id', 'login', 'type'],
            where: {id: adminId}
        }).then(function(admin) {
            if(admin) {
                return models.Subscription.update({
                    price: -1
                }, {
                    where: {id: req.body.id}
                }).then(function() {
                            Logs.LogSuccessIP(req, '200', 'Subscription deleted')
                            return res.status(200).json({'status': 'Subscription deleted'})
                });
            }
            else
            {
                return res.status(404).json({'error': 'Admin not found'})
            }
        });
    },
};


