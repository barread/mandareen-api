var bcrypt = require("bcrypt");
var jwtUtils = require('../../../utils/jwt.utils');
var models = require("../../../models/index");
const debug = require("debug")("app:patients.controller");
const path = require("path");
const mail = require(path.resolve("./libs/mail"));
var Stats = require('../../../utils/statistics');
var Logs = require('../../../utils/file_log_system');

//routes
module.exports = {
    getCares: function(req, res, next) {
        debug("getCares");

        Stats.UpdateRequestStat("Pro");
        let cares = [];

        return Promise.resolve()
        .then(getPatients)
        .then(() => {
            Logs.LogError(200, "GetCares : success");
            res.json(cares)})
        .catch(next);


        function getPatients() {
            return models.Care.findAll()
            .then(function(_cares) {cares = _cares;})
        }
    },
};