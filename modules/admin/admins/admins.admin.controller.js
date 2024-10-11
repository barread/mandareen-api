var jwtUtils = require('../../../utils/jwt.utils')
var Logs = require('../../../utils/file_log_system')
var models = require("../../../models/index")
var Stats = require('../../../utils/statistics');

//routes
module.exports = {
    getAdminData: function(req, res) {
        var headerAuth = req.headers['authorization'];
        var adminId = jwtUtils.getAdminId(headerAuth, 1);
        Stats.UpdateRequestStat("Admin");
        if(adminId < 0) {
            Logs.LogErrorIP(req, '401', "GetAdminData : wrong token");
            return res.status(401).json({'error': 'wrong token'});
        }
        models.Admin.findOne({
            attributes: ['id', 'login', 'firstname', 'lastname','email', 'type'],
            where: {id: adminId}
        }).then(function(admin) {
            if(admin) {
                Logs.LogSuccessIP(req, "201", "GetAdminData : ok");
                return res.status(201).json(admin);
            }
            else {
                Logs.LogErrorIP(req, '404', "GetAdminData : admin not found");
                return res.status(404).json({'error': 'admin not found'});
            }
        }).catch(function(err) {
            Logs.LogError('500', "GetAdminData : " + err);
            return res.status(500).json({'error': 'cannot fetch admin data'});
        });
    },

    getProfileAdmins: function(req, res){
        var headerAuth = req.headers['authorization'];
        var adminId = jwtUtils.getAdminId(headerAuth, 1);
        Stats.UpdateRequestStat("Admin");
        if(adminId < 0) {
            Logs.LogErrorIP(req, "401", "getAllAdmin : wrong token");
            return res.status(401).json({'error': 'wrong token'});
        }
        models.Admin.findAll({
            attributes: ['id', 'login', 'firstname', 'lastname', 'type', 'email', 'pass', "creation_date"],
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

    getProfilePro: function(req, res){
        var headerAuth = req.headers['authorization'];
        var adminId = jwtUtils.getAdminId(headerAuth, 1);
        Stats.UpdateRequestStat("Admin");

        if(adminId < 0) {
            Logs.LogErrorIP(req, "401", "getprofilepro : wrong token");
            return res.status(401).json({'error': 'wrong token'});
        }
        models.Pro.findAll({
            attributes: ['id', 'email', 'pass', 'civ', 'firstname', 'lastname', 'city', 'zipcode', 'adeli', 'phone', 'type'],
            order: [
                ['type', 'DESC']
            ]
        }).then(function(pros) {
            if(pros) {
                Logs.LogSuccessIP(req, "200", "getProfileAdmins : ok");
                return res.status(200).json(pros);
            }
            else {
                Logs.LogErrorIP(req, "404", "getProfileAdmins : not found");
                return res.status(404).json({'error': 'Pros not found'});
            }
        })
    },

    getAllAdmins: function(req, res){
        var headerAuth = req.headers['authorization'];
        var adminId = jwtUtils.getAdminId(headerAuth, 1);
        Stats.UpdateRequestStat("Admin");

        if(adminId < 0) {
            Logs.LogErrorIP(req, "401", "getAllAdmin : wrong token");
            return res.status(401).json({'error': 'wrong token'});
        }
        models.Admin.findAll({
            attributes: ['id', 'login', 'firstname', 'lastname', 'type', 'email'],
            order: [
                ['type', 'DESC']
            ]
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
};
