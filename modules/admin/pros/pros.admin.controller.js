var jwtUtils = require('../../../utils/jwt.utils');
var Logs = require('../../../utils/file_log_system');
var models = require("../../../models/index");
var bcrypt = require("bcrypt");
var Stats = require('../../../utils/statistics');

//routes
module.exports = {
    getAllPro: function(req, res){
        var headerAuth = req.headers['authorization'];
        var adminId = jwtUtils.getAdminId(headerAuth, 1);
        Stats.UpdateRequestStat("Admin");

        if(adminId < 0) {
            Logs.LogErrorIP(req, "401", "getAllPro : wrong token");
            return res.status(401).json({'error': 'wrong token'});
        }
        models.Pro.findAll({
            attributes: ['id', 'civ', 'firstname', 'lastname', 'type'],
            order: [
                ['type', 'DESC']
            ]
        }).then(function(pros) {
            if(pros) {
                //console.log(pros);
                Logs.LogSuccessIP(req, "200", "getAllPro : ok");
                return res.status(200).json(pros);
            }
            else {
                Logs.LogErrorIP(req, "404", "getAllPro : not found");
                return res.status(404).json({'error': 'Pros not found'});
            }
        }).catch(function(err) {
            Logs.LogError('500', "GetAllPatient : " + err);
            return res.status(500).json({'error': 'cannot fetch pro data'});
        });
    },

    getProfilePro: function(req, res){
        var headerAuth = req.headers['authorization'];
        var adminId = jwtUtils.getAdminId(headerAuth, 1);
        Stats.UpdateRequestStat("Admin");

        if(adminId < 0) {
            Logs.LogErrorIP(req, "401", "getAllAdmin : wrong token");
            return res.status(401).json({'error': 'wrong token'});
        }
        models.Pro.findAll({
            attributes: ['id', 'civ', 'firstname', 'lastname', 'type', 'email', 'city', 'zipcode', 'phone', 'adeli'],
            order: [
                ['type', 'DESC']
            ],
        }).then(function(pros) {
            if(pros) {
                Logs.LogSuccessIP(req, "200", "getAllAdmins : ok");
                return res.status(200).json(pros);
            }
            else {
                Logs.LogErrorIP(req, "404", "getAllAdmins : not found");
                return res.status(404).json({'error': 'Pros not found'});
            }
        })
    },

    updatePro: function(req, res) {
        Stats.UpdateRequestStat("Admin");
        if (req.body.password != '') {
            var passwd = req.body.password;
            bcrypt.hash(passwd, 5, function(err, bcryptedPassword) {
                return models.Pro.update({
                    civ: req.body.civ,
                    email: req.body.email,
                    firstname: req.body.firstname,
                    lastname: req.body.lastname,
                    type: req.body.type,
                    city: req.body.city,
                    adeli: req.body.adeli,
                    zipcode: req.body.zipcode,
                    phone: req.body.phone,
                    pass: bcryptedPassword
                }, {
                    where: {id: req.body.id}
                })
                    .then(function (result) {
                        return res.json(result);
                    }).catch(function (err) {
                        Logs.LogErrorIP(req, "500", "updatePro : " + err);
                        return (res.status(500).json({'Error': 'Cannot update pro'}));
                    });
            })
        }
        else {
            return models.Pro.update({
                    civ: req.body.civ,
                    email: req.body.email,
                    firstname: req.body.firstname,
                    lastname: req.body.lastname,
                    type: req.body.type,
                    city: req.body.city,
                    zipcode: req.body.zipcode,
                    phone: req.body.phone
                },
                {
                    where: {id: req.body.id}
                })
                .then(function (result) {
                    return res.json(result);
                })
                .catch(function (err) {
                    Logs.LogErrorIP(req, "500", "updatePro : " + err);
                    return (res.status(500).json({'Error': 'Cannot update pro'}));
                });
        }
    },
};


