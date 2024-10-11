var bcrypt = require("bcrypt");
var jwtUtils = require('../../../utils/jwt.utils');
var models = require("../../../models/index");
const debug = require("debug")("app:account.controller");
var Stats = require('../../../utils/statistics');
var Logs = require('../../../utils/file_log_system');

//routes
module.exports = {
    update: function(req, res, next) {
        debug("update");

        Stats.UpdateRequestStat("Pro");
        const updatePro = req.body;
        return models.Pro.update(updatePro,{where: {id: updatePro.id}})
        .then(function(pro) { 
            Logs.LogSuccessIP(req, 200, "update Pro : success");
            return res.json(pro);
        })
        .catch(function(err) {
            Logs.LogError(500, "update pro : " + err);
            return res.status(500).json({'error': 'unable to verify pro'});
        });
    },
    updateEmail: function(req, res, next) {
        debug("updateEmail");

        Stats.UpdateRequestStat("Pro");
        const email = req.body.email;

        return models.Pro.update(
            {email: email},
            {where: {id: req.body.pro_id}}
        )
        .then(function() { 
            Logs.LogSuccessIP(req, 200, "update email Pro : success");
            return res.json({res: "OK"}); 
        })
        .catch(function(err) {
            Logs.LogError(500, "update email pro : " + err);
            return res.status(500).json({'error': 'unable to verify pro'});
        });
    },
    updatePassword: function(req, res, next) {
        debug("updatePassword");
        
        Stats.UpdateRequestStat("Pro");
        bcrypt.hash(req.body.currentPassword, 5, function(err, bcryptedPassword) {
            return models.Pro.findOne({where: {id: req.body.pro_id}})
            .then(function(proFound) {
                bcrypt.compare(req.body.currentPassword, proFound.pass, function(errBycrypt, resBycrypt) {
                    if(resBycrypt) {
                        bcrypt.hash(req.body.newPassword, 5, function(err, bcryptedPassword) {
                            return models.Pro.update(
                                {pass: bcryptedPassword},
                                {where: {id: req.body.pro_id}}
                            )
                            .then(function() { 
                                Logs.LogSuccessIP(req, 200, "update Password pro : success");
                                return res.json("OK"); })
                        });
                    }
                    else {
            Logs.LogError(403, "Update Password pro : Invalid password");
            return res.status(403).json({"error": "invalid password"});
        }
                });
            })
            .catch(next);
        });
    }
};