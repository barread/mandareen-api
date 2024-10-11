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
  register: function (req, res, next) {
    debug ('register');

    Stats.UpdateRequestStat ('Pro');
    var email = req.body.email.toLowerCase ();
    var password = req.body.password;
    var civ = req.body.civility;
    var firstname = req.body.firstname;
    var lastname = req.body.lastname;
    var city = req.body.city;
    var phone = req.body.phone;
    var zipcode = req.body.zipcode;
    var adeli = req.body.adeli;

    if (
      !email ||
      !password ||
      !civ ||
      !firstname ||
      !lastname ||
      !city ||
      !phone ||
      !zipcode
    ) {
      Logs.LogError (400, 'Register pro : missing parameter');
      return res.status (400).json ({error: 'missing paramaters'});
    }

    // TODO verification

    return models.Pro
      .find ({
        attributes: ['email'],
        where: {email: crypt.Encrypt (email)},
      })
      .then (function (proFound) {
        if (!proFound) {
          bcrypt.hash (password, 5, function (err, bcryptedPassword) {
            var newPro = models.Pro
              .create ({
                email: email,
                pass: bcryptedPassword,
                civ: civ,
                firstname: firstname,
                lastname: lastname,
                city: city,
                phone: phone,
                zipcode: zipcode,
                adeli: adeli,
              })
              .then (function (newPro) {
                mailManager.NewProMail (newPro);
                Logs.LogSuccessIP (req, 200, 'Register pro : success');
                return res.status (200).json ({proId: newPro.id});
              })
              .catch (function (err) {
                Logs.LogError (500, 'Register pro : ' + err);
                return res.status (500).json ({error: 'cannot add pro'});
              });
          });
        } else {
          Logs.LogError (409, 'Register pro : pro already exist');
          return res.status (409).json ({error: 'pro already exist'});
        }
      })
      .catch (function (err) {
        Logs.LogError (500, 'Register pro : ' + err);
        return res.status (500).json ({error: 'unable to verify pro'});
      });
  },
  login: function (req, res, next) {
    debug ('login');

    Stats.UpdateRequestStat ('Pro');
    var email = req.body.email.toLowerCase ();
    var password = req.body.password;

    if (email == null || password == null) {
      Logs.LogError (400, 'login pro : Missing parameters');
      return res.status (400).json ({error: 'missing parameters'});
    }
    debug (email);
    debug (crypt.Encrypt (email));
    return models.Pro
      .findOne ({
        exclude: ['pass'],
        where: {email: crypt.Encrypt(email)}
        //where: {email: email},
      })
      .then (function (proFound) {
        if (proFound) {
          bcrypt.compare (password, proFound.pass, function (
            errBycrypt,
            resBycrypt
          ) {
            if (resBycrypt) {
              Logs.LogSuccessIP (req, 200, 'login pro : success');
              return res.status (200).json ({
                pro: proFound,
                token: jwtUtils.generateTokenForPro (proFound),
              });
            } else {
              Logs.LogError (401, 'login pro : Invalid password');
              return res.status (401).json ({error: 'Login failed'});
            }
          });
        } else {
          Logs.LogError (401, "login pro : pro don't exist in DB");
          return res.status (401).json ({error: 'Login failed'});
        }
      })
      .catch (function (err) {
        debug (err);
        Logs.LogError (500, 'login pro : ' + err);
        return res.status (500).json ({error: 'unable to verify pro'});
      });
  },
  sendEmailPassword: function (req, res, next) {
    debug ('sendEmailPassword');

    Stats.UpdateRequestStat ('Pro');
    var email = req.body.email;

    if (!email) {
      Logs.LogError (400, 'Send email password pro : Missing email');
      return res.status (400).json ({error: 'missing email'});
    }

    return models.Pro
      .findOne ({
        exclude: ['pass'],
        where: {email: crypt.Encrypt (email)},
        //where: { email: email }
      })
      .then (function (proFound) {
        if (proFound) {
          var state = 'err';
          var newPassword = Math.random ().toString (36).slice (-8);

          var transporter = mailer.createTransport ({
            service: 'Gmail',
            auth: {
              user: 'contact.mandareen@gmail.com',
              pass: '20ManDa1reEn8',
            },
            tls: {
              rejectUnauthorized: false,
            },
          });

          var firstname = crypt.Uncrypt(proFound.dataValues.firstname);
          var lastname = crypt.Uncrypt(proFound.dataValues.lastname).toUpperCase();
          var civility = proFound.dataValues.civ;

          var mail = {
            from: 'contact.mandareen@gmail.com',
            to: req.body.email,
            subject: '[No-Reply] Changement de mot de passe - Mandareen Pro',
            html: '<p>Bonjour ' + civility + ' ' + lastname + ' ' + firstname + ',</p>' +
              '<p>Une requête de modification de mot de passe a été effectuée pour votre compte Mandareen Pro.</p>' +
              "<p>Votre nouveau mot de passe est: '" + newPassword + "'.</p>" +
              "<br><p>Ce mail a été envoyé automatiquement. Merci de ne pas y répondre.</p>" +
              '<img width="50" height="50" src="https://pro.mandareen.fr/assets/img/favicon.ico"/>' +
              "L'équipe Mandareen.",
          };
          transporter.sendMail (mail, function (error, response) {
            if (error) {
              state = 'err';
              Logs.LogError ('500', 'ResetPasswdPro : ' + error);
              return res.status (500).json ({error: 'Send mail failed'});
            } else {
              state = 'ok';
              Logs.LogError ('200', 'ResetPasswdPro : ' + err);
              return res.status (200).json ({message: 'email send'});
            }
          });

          bcrypt.hash (newPassword, 5, function (err, bcryptedPassword) {
            return models.Pro
              .update (
                {
                  pass: bcryptedPassword,
                },
                {
                  where: {email: crypt.Encrypt (req.body.email)},
                }
              )
              .then (function (result) {
                return res.json (result);
              })
              .catch (function (err) {
                console.log ('Error changing password');
                console.log ('Log : ' + err);
                Logs.LogError (500, 'ResetPasswdPro : ' + err);
                return res
                  .status (500)
                  .json ({Error: 'Cannot change password'});
              });
          });
        } else {
          Logs.LogError (404, "ResetPasswdPro : pro don't exist in DB");
          return res.status (404).json ({error: 'pro not exist in DB'});
        }
      })
      .catch (function (err) {
        Logs.LogError (500, 'ResetPasswdPro : ' + err);
        return res.status (500).json ({error: 'unable to verify pro'});
      });
  },
};
