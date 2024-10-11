var bcrypt = require ('bcrypt');
var jwtUtils = require ('../../../utils/jwt.utils');
var models = require ('../../../models/index');
const debug = require ('debug') ('app:auth.controller');
var crypt = require ('../../../utils/encryption');
var mailer = require ('nodemailer');
var mailManager = require ('../../../utils/mail_sender');
var Logs = require ('../../../utils/file_log_system');
var Stats = require ('../../../utils/statistics');

//routes
module.exports = {
  list: function (req, res, next) {
    debug ('list');

    return models.Answer
      .findAll()
      .then(answers => {
        return res.json(answers);
      })
      .catch(function (err) {
        debug (err);
        Logs.LogError (500, 'login pro : ' + err);
        return res.status (500).json ({error: 'unable to verify pro'});
      });
  },
};
