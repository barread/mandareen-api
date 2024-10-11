var bcrypt = require("bcrypt");
var jwtUtils = require('../../../utils/jwt.utils')
var Logs = require('../../../utils/file_log_system')
var models = require("../../../models/index")
var mailer = require("nodemailer");
var crypt = require('../../../utils/encryption');
var Stats = require('../../../utils/statistics');

//routes
module.exports = {
    adminLogin: function (req, res) {
        var login = req.body.login;
        var password = req.body.password;
        Stats.UpdateRequestStat("Admin");
        if (login == null || password == null) {
            Logs.LogErrorIP(req, '401', 'Admin : missing parameters');
            return res.status(401).json({ 'error': 'missing parameters' });
        }
        models.Admin.findOne({
            attributes: ['id', 'login', 'pass', 'type'],
            where: { login: login }
        })
            .then(function (adminFound) {
                if (adminFound) {
                    bcrypt.compare(password, adminFound.pass, function (errBycrypt, resBycrypt) {
                        if (resBycrypt) {
                            Logs.LogSuccessIP(req, '200', 'Connected to admin')
                            return res.status(200).json({
                                'token': jwtUtils.generateTokenForAdmin(adminFound),
                                'right': adminFound.type
                            });
                        }
                        else {
                            Logs.LogErrorIP(req, '403', 'Admin : invalid password');
                            return res.status(403).json({ "error": "invalid password" });
                        }
                    });
                }
                else {
                    Logs.LogErrorIP(req, '404', 'Admin : not exist in DB');
                    return res.status(404).json({ 'error': 'admin not exist in DB' });
                }
            })
            .catch(function (err) {
                Logs.LogError('500', "adminLogin" + err);
                return res.status(500).json({ 'error': 'unable to verify admin' });
            });
    },
    addAdmin: function (req, res) {
        var headerAuth = req.headers['authorization'];
        var adminId = jwtUtils.getAdminId(headerAuth, 1);
        var Newlogin = req.body.login;
        var password = req.body.password;
        var firstname = req.body.firstname;
        var lastname = req.body.lastname;
        var email = req.body.email;
        var type = req.body.type;
        Stats.UpdateRequestStat("Admin");
        if (Newlogin == null || password == null || firstname == null || lastname == null || type == null || email == null) {
            Logs.LogErrorIP(req, '400', "addAdmin : missing paramaters");
            return res.status(400).json({ 'error': 'missing paramaters' });
        }
        if (adminId < 0) {
            Logs.LogErrorIP(req, '401', "addAdmin : wrong token");
            return res.status(401).json({ 'error': 'wrong token' });
        }
        models.Admin.findOne({
            attributes: ['id', 'login', 'type'],
            where: { id: adminId }
        }).then(function (admin) {
            if (admin && admin.type == "Super-Admin") {
                models.Admin.findOne({
                    attributes: ['id'],
                    where: { login: Newlogin }
                }).then(function (already) {
                    if (already) {
                        Logs.LogErrorIP(req, '409', "addAdmin : Already exist");
                        return res.status(409).json({ 'error': 'admin already exist' });
                    }
                    else {
                        bcrypt.hash(password, 5, function (err, bcryptedPassword) {
                            var newAdmin = models.Admin.create({
                                login: Newlogin,
                                pass: bcryptedPassword,
                                firstname: firstname,
                                lastname: lastname,
                                email: email,
                                type: type
                            })
                                .then(function (newAdmin) {
                                    Logs.LogSuccessIP(req, '201', 'Created admin ' + newAdmin.login);
                                    return res.status(201).json({ 'adminId': newAdmin.id })
                                })
                                .catch(function (err) {
                                    Logs.LogError('500', "addAdmin : " + err);
                                    return (res.status(500).json({ 'error': 'cannot add admin' }));
                                });
                        });
                    }
                })
            }
            else {
                Logs.LogErrorIP(req, '404', "addAdmin : super-admin not found");
                return res.status(404).json({ 'error': 'super-admin not found' });
            }
        }).catch(function (err) {
            Logs.LogError('500', "addAdmin : " + err);
            return res.status(500).json({ 'error': 'cannot fetch admin data' });
        });
    },

    updateAdmin: function (req, res) {
        var headerAuth = req.headers['authorization'];
        var adminId = jwtUtils.getAdminId(headerAuth, 1);
        Stats.UpdateRequestStat("Admin");
        if (adminId < 0) {
            Logs.LogErrorIP(req, '401', "addAdmin : wrong token");
            return res.status(401).json({ 'error': 'wrong token' });
        }
        if (req.body.password != '') {
            var passwd = req.body.password;
            bcrypt.hash(passwd, 5, function (err, bcryptedPassword) {
                return models.Admin.update({
                    login: req.body.login,
                    firstname: req.body.firstname,
                    lastname: req.body.lastname,
                    email: req.body.email,
                    type: req.body.type,
                    pass: bcryptedPassword
                }, {
                        where: { id: req.body.id }
                    })
                    .then(function (result) {
                        return res.json(result);
                    }).catch(function (err) {
                        console.log('Error updating admin');
                        console.log('Log : ' + err);
                        return (res.status(500).json({ 'Error': 'Cannot update admin' }));
                    });
            })
        }
        else {
            return models.Admin.update({
                login: req.body.login,
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                email: req.body.email,
                type: req.body.type,
            },
                {
                    where: { id: req.body.id }
                })
                .then(function (result) {
                    return res.json(result);
                })
                .catch(function (err) {
                    console.log('Error updating admin');
                    console.log('Log : ' + err);
                    return (res.status(500).json({ 'Error': 'Cannot update admin' }));
                });
        }
    },

    deleteAdmin: function (req, res) {
        var headerAuth = req.headers['authorization'];
        var adminId = jwtUtils.getAdminId(headerAuth, 1);
        Stats.UpdateRequestStat("Admin");
        if (adminId < 0) {
            Logs.LogErrorIP(req, '401', "addAdmin : wrong token");
            return res.status(401).json({ 'error': 'wrong token' });
        }
        return models.Admin.findOne({
            attributes: ['id', 'login', 'type'],
            where: { id: adminId }
        }).then(function (admin) {
            if (admin && admin.type == "Super-Admin") {
                return models.Admin.destroy({
                    where: {
                        id: {
                            $eq: req.body.id
                        },
                        type: {
                            $ne: "Super-Admin"
                        }
                    }
                })
                    .then(function (rowDeleted) {
                        if (rowDeleted === 1) {
                            Logs.LogSuccessIP(req, '200', 'Admin deleted')
                            return res.status(200).json({ 'status': 'Admin deleted' })
                        }
                        else {
                            Logs.LogError('403', 'Admin cannot be deleted')
                            return res.status(403).json({ 'Error': 'Admin cannot be deleted' })
                        }
                    }).catch(function (err) {
                        console.log('Error updating admin');
                        console.log('Log : ' + err);
                        return (res.status(500).json({ 'Error': 'Cannot update admin' }));
                    });
            }else {
                Logs.LogError('403', 'Not sufficient access right')
                return res.status(403).json({ 'Error': 'Unauthorized' })
            }
        });
    },

    resetPwd: function (req, res) {
        Stats.UpdateRequestStat("Admin");
        var login = req.body.login;
        var state = "err";
        if (req.body.first == "true")
            message = "<p>Un compte administrateur Mandareen vient d'être créé pour votre addresse mail.</p><p>Vous devez choisir votre mot de passe en cliquant sur ce lien :";
        else
            message = "<p>Une demande de mot de passe vient d'être effectuée pour votre compte administrateur de mandareen.</p><p>Cliquez sur ce lien pour changer votre mot de passe :";

        if (login == null) {
            Logs.LogError('400', "ResetPasswdAdmin : missing parameters");
            return res.status(400).json({ 'error': 'missing parameters' });
        }
        models.Admin.findOne({
            attributes: ['id', 'login', 'email'],
            where: { login: login }
        })
            .then(function (adminFound) {
                if (adminFound) {
                    var mailTo = adminFound.email;
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
                        to: mailTo,
                        subject: "[No-Reply] Changement de mot de passe - Mandareen admin",
                        html: "<p>Bonjour " + login + ",</p>" + message
                            + "<p>https://admin.mandareen.fr/passwd?dt=" + jwtUtils.generateTokenForPasswdAdmin(adminFound) +
                            "</p><br><p>Ce lien n'est valable que pendant 10 minutes.</p>" +
                            "<p> Si vous n'avez pas demandé cet email, veuillez l'ignorer et le supprimer.</p>"
                    }
                    transporter.sendMail(mail, function (error, response) {
                        if (error) {
                            state = "err";
                            Logs.LogError('500', "ResetPasswdAdmin : " + error);
                            return res.status(500).json({ "error": "Send mail failed" });
                        }
                        else {
                            state = "ok"
                            Logs.LogError('200', "ResetPasswdAdmin : ");
                            return res.status(200).json({ 'message': "email send" });
                        }
                        done();
                    });
                    return res.status(200).json({ 'message': state });
                }
                else {
                    Logs.LogError('404', "ResetPasswdAdmin : admin not exist in DB");
                    return res.status(404).json({ 'error': 'admin not exist in DB' });
                }
            })
            .catch(function (err) {
                Logs.LogError('500', "ResetPasswdAdmin : " + err);
                return res.status(500).json({ 'error': 'unable to verify admin' });
            });
    },

    passwd: function (req, res) {
        Stats.UpdateRequestStat("Admin");
        var headerAuth = req.headers['authorization'];
        var adminId = jwtUtils.getAdminId(headerAuth, 0);
        var newPwd = req.body.newPwd;
        var oldPwd = req.body.oldPwd;
        if (adminId < 0) {
            Logs.LogErrorIP(req, '401', "PasswdAdmin : wrong token");
            return res.status(401).json({ 'error': 'wrong token' });
        }
        models.Admin.findOne({
            attributes: ['id', 'login', 'pass', 'type'],
            where: { id: adminId }
        }).then(function (admin) {
            if (admin) {
                if (jwtUtils.getAdminId(headerAuth, 1) != -2) {
                    bcrypt.compare(oldPwd, admin.pass, function (errBycrypt, resBycrypt) {

                        if (resBycrypt) {
                            bcrypt.hash(newPwd, 5, function (err, bcryptedPassword) {
                                admin.update({
                                    pass: bcryptedPassword
                                }).then(() => { })
                            });
                            Logs.LogSuccessIP(req, "200", "PasswdAdmin : password changed")
                            return res.status(200).json({ 'message': 'password changed' });
                        }
                        else {
                            Logs.LogErrorIP(req, '400', "PasswdAdmin : not found");
                            return res.status(400).json({ 'error': 'not found' });
                        }
                    });
                }
                else {
                    bcrypt.hash(newPwd, 5, function (err, bcryptedPassword) {
                        admin.update({
                            pass: bcryptedPassword
                        }).then(() => { })
                    });
                    Logs.LogSuccessIP(req, "200", "PasswdAdmin : password changed")
                    return res.status(200).json({ 'message': 'password changed' });
                }
            }
            else {
                Logs.LogErrorIP(req, '400', "PasswdAdmin : not found");
                return res.status(400).json({ 'error': 'not found' });
            }
        }).catch(function (err) {
            Logs.LogError('500', "PasswdAdmin : " + err);
            return res.status(500).json({ 'error': 'cannot change password' });
        });
    },
};
