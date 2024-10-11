var jwtUtils = require('../../../utils/jwt.utils')
var Logs = require('../../../utils/file_log_system')
var models = require("../../../models/index")
var Stats = require('../../../utils/statistics');

//routes
module.exports = {
    getAllPatient: function(req, res){
        var headerAuth = req.headers['authorization'];
        var adminId = jwtUtils.getAdminId(headerAuth, 1);
        Stats.UpdateRequestStat("Admin");

        if(adminId < 0) {
            Logs.LogErrorIP(req, '401', "GetAllPatient : wrong token");
            return res.status(401).json({'error': 'wrong token'});
        }
        models.Patient.findAll({
            attributes: ['id', 'civ', 'firstname', 'lastname']
        }).then(function(pros) {
            if(pros) {
                Logs.LogSuccessIP(req, "200", "GetAllPatient : ok");
                return res.status(200).json(pros);
            }
            else {
                Logs.LogErrorIP(req, '404', "GetAllPatient : patient not found");
                return res.status(404).json({'error': 'Patient not found'});
            }
        }).catch(function(err) {
            Logs.LogError('500', "GetAllPatient : " + err);
            return res.status(500).json({'error': 'cannot fetch patient data'});
        });
    },
};
