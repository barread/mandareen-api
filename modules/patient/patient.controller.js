var bcrypt = require("bcrypt");
var jwtUtils = require("../../utils/jwt.utils");
var models = require("../../models/index");
var sequelize = require("sequelize");
const debug = require("debug")("app:patient.controller");
var Twig = require("twig");
var mailer = require("nodemailer");
var Logs = require("../../utils/file_log_system");
var moment = require("moment");
var fs = require("fs");
var crypt = require("../../utils/encryption");
var Stats = require('../../utils/statistics');

var client_id = "096ad8a4b7964882ae5696af72cd1842";
var client_secret = "b56336be911a4f2caec48a539240fbe5";

const config = require("../../config");
const HttpsProxyAgent = require('https-proxy-agent');
const http = require('http');
const https = require('https');
const proxy = config.proxy;
const agent = proxy ? new HttpsProxyAgent(proxy) : false;
const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Authorization": "Basic ZWI2YTQ0YTctNTYxMy00NDAwLTg1YWMtMGMzZmQ3MGRmZDFi"
};

function splitTime(time) {
  var returnTime = new Date();
  var split = time.split(":");

  returnTime.setHours(+split[0]);
  returnTime.setMinutes(split[1]);
  returnTime.setSeconds(split[2]);

  return returnTime;
}

function timeToString(time) {
  return time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds();
}

function generateRandomString(length) {
  var text = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

function notOnlyALogger(msg) {
    console.log('hey, Im a single log');
    //do whatever you need in here
    console.log(msg);
}

//routes
module.exports = {

    //********************** LOGIN **********************\\
    login: function (req, res) {
        debug("login");

        Stats.UpdateRequestStat("Patient");
        var email = req.body.email.toLowerCase();
        var password = req.body.password;

        if (email == null || password == null) {
            Logs.LogError(400, "login Patient : " + err)
            return res.status(400).json({ error: "missing parameters" });
        }

        return models.Patient.findOne({
            exclude: ["pass"],
            where: { email: crypt.Encrypt(email) },
            logging: notOnlyALogger
            //where: { email: email }
        })
            .then(function (patientFound) {
                if (patientFound) {
                    bcrypt.compare(password, patientFound.pass, function (
                        errBycrypt,
                        resBycrypt
                    ) {
                        if (resBycrypt) {
                            return res.status(200).json({
                                patient: patientFound,
                                token: jwtUtils.generateTokenForPro(patientFound)
                            });
                        } else {
                            Logs.LogError(403, "login Patient : Invalid password")
                            return res.status(403).json({ error: "invalid password" });
                        }
                    });
                } else {
                    Logs.LogError(404, "login Patient : Not found")
                    return res.status(404).json({ error: "User not found" });
                }
            })
            .catch(function (err) {
                Logs.LogError(500, "login Patient : " + err)
                return res.status(500).json({ error: "unable to verify pro" });
            });
    },

    authentificate: function (req, res) {
        debug("authentificate");

        console.log(req.body);
        var email = req.body.email.toLowerCase();
        var password = req.body.password;

        if (email == null || password == null) {
            Logs.LogError(400, "login Patient : " + err)
            return res.status(400).json({ error: "missing parameters" });
        }

        return models.Patient.findOne({
            exclude: ["pass"],
            where: { email: crypt.Encrypt(email) }
            //where: { email: email }
        })
            .then(function (patientFound) {
                if (patientFound) {
                    bcrypt.compare(password, patientFound.pass, function (
                        errBycrypt,
                        resBycrypt
                    ) {
                        if (resBycrypt) {
                            return res.status(200).json(patientFound);
                        } else {
                            Logs.LogError(403, "login Patient : Invalid password")
                            return res.status(403).json({ error: "invalid password" });
                        }
                    });
                } else {
                    Logs.LogError(404, "login Patient : Not found")
                    return res.status(404).json({ error: "User not found" });
                }
            })
            .catch(function (err) {
                Logs.LogError(500, "login Patient : " + err)
                return res.status(500).json({ error: "unable to verify pro" });
            });
    },

    //********************** PERSONAL INFORMATION **********************\\
    findById: function (req, res, next) {
        debug("findById");

        Stats.UpdateRequestStat("Patient");
        return models.Patient.findOne({
            where: {
                id: req.params.id
            }
        })
            .then(function (patient) {
                return res.json(patient);
            })
            .catch(next);
    },

    timePassedOnPage: function (req, res, next) {
        debug("timePassedOnPage");

        Stats.UpdateRequestStat("Patient");
        var date = req.body.date;
        var time = req.body.time;
        var patient_id = req.body.patient_id;
        var page = req.body.page;

        return models.Stats.findOrCreate({
            where: {
                id_patient: patient_id,
                report_date: date
            },
            defaults: {
                id_patient: patient_id,
                report_date: date
            }
        })
            .then(function (result) {
                if (page === "Diary") {
                    models.Stats.findOne({
                        attributes: ["diary_time"],
                        where: {
                            id_patient: patient_id,
                            report_date: date
                        }
                    }).then(function (diary_time) {
                        if (!diary_time.dataValues.diary_time)
                            return models.Stats.update(
                                {
                                    diary_time: time
                                },
                                {
                                    where: {
                                        id_patient: patient_id,
                                        report_date: date
                                    }
                                }
                            );
                        else {
                            var dbTime = splitTime(diary_time.dataValues.diary_time);
                            var applicationTime = splitTime(time);

                            var totalTime = new Date(
                                null,
                                null,
                                null,
                                dbTime.getHours() + applicationTime.getHours(),
                                dbTime.getMinutes() + applicationTime.getMinutes(),
                                dbTime.getSeconds() + applicationTime.getSeconds()
                            );
                            return models.Stats.update(
                                {
                                    diary_time: timeToString(totalTime)
                                },
                                {
                                    where: {
                                        id_patient: patient_id,
                                        report_date: date
                                    }
                                }
                            );
                        }
                    });
                } else if (page === "Recipes") {
                    models.Stats.findOne({
                        attributes: ["recipe_time"],
                        where: {
                            id_patient: patient_id,
                            report_date: date
                        }
                    }).then(function (recipe_time) {
                        if (!recipe_time.dataValues.recipe_time)
                            return models.Stats.update(
                                {
                                    recipe_time: time
                                },
                                {
                                    where: {
                                        id_patient: patient_id,
                                        report_date: date
                                    }
                                }
                            );
                        else {
                            var dbTime = splitTime(recipe_time.dataValues.recipe_time);
                            var applicationTime = splitTime(time);

                            var totalTime = new Date(
                                null,
                                null,
                                null,
                                dbTime.getHours() + applicationTime.getHours(),
                                dbTime.getMinutes() + applicationTime.getMinutes(),
                                dbTime.getSeconds() + applicationTime.getSeconds()
                            );
                            return models.Stats.update(
                                {
                                    recipe_time: timeToString(totalTime)
                                },
                                {
                                    where: {
                                        id_patient: patient_id,
                                        report_date: date
                                    }
                                }
                            );
                        }
                    });
                } else if (page === "Total") {
                    models.Stats.findOne({
                        attributes: ["app_time"],
                        where: {
                            id_patient: patient_id,
                            report_date: date
                        }
                    }).then(function (app_time) {
                        if (!app_time.dataValues.app_time)
                            return models.Stats.update(
                                {
                                    app_time: time
                                },
                                {
                                    where: {
                                        id_patient: patient_id,
                                        report_date: date
                                    }
                                }
                            );
                        else {
                            var dbTime = splitTime(app_time.dataValues.app_time);
                            var applicationTime = splitTime(time);

                            var totalTime = new Date(
                                null,
                                null,
                                null,
                                dbTime.getHours() + applicationTime.getHours(),
                                dbTime.getMinutes() + applicationTime.getMinutes(),
                                dbTime.getSeconds() + applicationTime.getSeconds()
                            );
                            return models.Stats.update(
                                {
                                    app_time: timeToString(totalTime)
                                },
                                {
                                    where: {
                                        id_patient: patient_id,
                                        report_date: date
                                    }
                                }
                            );
                        }
                    });
                }
                return res.status(200).json({ "200": "Ok" });
            })
            .catch(function (err) {
                Logs.LogError(500, "timePassedOnPage Patient : " + err)
                return res
                    .status(500)
                    .json({ error: "The server encountered an error" });
            });
    },

    changeEmail: function (req, res, next) {
        debug("changeEmail");

        Stats.UpdateRequestStat("Patient");
        const newEmail = req.body.newEmail;
        const id_patient = req.body.id;
        debug(req.body);

        return models.Patient.findOne({
            where: {
                email: crypt.Encrypt(newEmail)
            }
        }).then(result => {
            if (!result) {
                debug("ici");
                return models.Patient.update(
                    {
                        email: newEmail
                    },
                    {
                        where: { id: id_patient }
                    }
                )
                    .then(function () {
                        return res.json(newEmail);
                    })
                    .catch(function (err) {
                        console.log("Error changing email");
                        console.log("Log : " + err);
                        Logs.LogError(500, "changeEmail Patient : " + err)
                        return res.status(500).json({ Error: "Cannot change email" });
                    });
            }
            else {
                return res.status(500).json({ Error: "L'email entré existe déjà" });
            }
        })
            .catch(err => {
                debug(err);
            })
    },

    changePassword: function (req, res, next) {
        debug("changePassword");

        Stats.UpdateRequestStat("Patient");
        bcrypt.hash(req.body.oldPassword, 5, function (err, bcryptedPassword) {
            return models.Patient.findOne({
                where: { id: req.body.id }
            })
                .then(function (patientfound) {
                    bcrypt.compare(req.body.oldPassword, patientfound.pass, function (
                        errBycrypt,
                        resBycrypt
                    ) {
                        if (resBycrypt) {
                            bcrypt.hash(req.body.newPassword, 5, function (
                                err,
                                bcryptedPassword
                            ) {
                                return models.Patient.update(
                                    {
                                        pass: bcryptedPassword
                                    },
                                    {
                                        where: { id: req.body.id }
                                    }
                                )
                                    .then(function (result) {
                                        return res.json(result);
                                    })
                                    .catch(function (err) {
                                        console.log("Error changing password");
                                        console.log("Log : " + err);
                                        Logs.LogError(500, "changePassword Patient : " + err);
                                        return res
                                            .status(500)
                                            .json({ Error: "Cannot change password" });
                                    });
                            });
                        } else {
                            Logs.LogError(403, "changePassword Patient : invalid password");
                            return res.status(403).json({ error: "invalid password" });
                        }
                    });
                })
                .catch(next);
        });
    },

    sendEmailPassword: function (req, res, next) {
        debug("sendEmailPassword");

        Stats.UpdateRequestStat("Patient");
        var email = req.body.email;

        if (!email) {
            return res.status(400).json({ error: "missing email" });
        }

        return models.Patient.findOne({
            exclude: ["pass"],
            where: { email: crypt.Encrypt(email) }
        })
            .then(function (patientFound) {
                if (patientFound) {
                    var state = "err";
                    var randomstring = Math.random()
                        .toString(36)
                        .slice(-8);

                    var transporter = mailer.createTransport({
                        service: "Gmail",
                        auth: {
                            user: "contact.mandareen@gmail.com",
                            pass: "20ManDa1reEn8"
                        },
                        tls: {
                            rejectUnauthorized: false
                        }
                    });

                    var mail = {
                        from: "contact.mandareen@gmail.com",
                        to: req.body.email,
                        subject:
                            "[No-Reply] Changement de mot de passe - Mandareen Patient",
                        html:
                            "<p>Bonjour</p>" +
                            "<br><p>Vous avez fait une requête de modification de mot passe pour votre compte mandareen patient</p>" +
                            "<br><p>Votre nouveau mot de passe est: '" +
                            randomstring +
                            "'</p>"
                    };
                    transporter.sendMail(mail, function (error, response) {
                        if (error) {
                            state = "err";
                            Logs.LogError("500", "sendEmailPassword : " + err);
                            return res.status(500).json({ error: "Send mail failed" });
                        } else {
                            state = "ok";
                            Logs.LogError("200", "sendEmailPassword : " + err);
                            return res.status(200).json({ message: "email send" });
                        }
                    });

                    bcrypt.hash(randomstring, 5, function (err, bcryptedPassword) {
                        return models.Patient.update(
                            {
                                pass: bcryptedPassword
                            },
                            {
                                where: { email: crypt.Encrypt(req.body.email) }
                            }
                        )
                            .then(function (result) {
                                return res.json(result);
                            })
                            .catch(function (err) {
                                console.log("Error changing password");
                                console.log("Log : " + err);
                                Logs.LogError(500, "sendEmailPassword : " + err);
                                return res
                                    .status(500)
                                    .json({ Error: "Cannot change password" });
                            });
                    });
                } else {
                    return res.status(404).json({ error: "pro not exist in DB" });
                }
            })
            .catch(function (err) {
                Logs.LogError(500, "sendEmailPassword : " + err);
                return res.status(500).json({ error: "unable to verify pro" });
            });
    },

    //********************** DIARY **********************\\

    createDiary: function (req, res) {
        debug("createDiary");

        Stats.UpdateRequestStat("Patient");
        return models.Diary.create({
            content: req.body.content,
            patient_id: req.body.id,
        })
            .then(function () {
                return res.status(201).json("ok");
            })
            .catch(function (err) {
                debug("Error create diary Patient - " + err);
                Logs.LogError(500, "CreateDiary : " + err)
                return res.status(500).json({ error: "cannot add diary entry" });
            });
    },

    updateDiary: function (req, res) {
        debug("Update Diary");
        
        Stats.UpdateRequestStat("Patient");
        return models.Diary.update(
            {
                content: req.body.content
            },
            {
                where: { id: req.body.id }
            }
        )
            .then(function (result) {
                return res.json(result);
            })
            .catch(function (err) {
                console.log("Error updating diary");
                console.log("Log : " + err);
                Logs.LogError(500, "updateDiary Patient : " + err)
                return res.status(500).json({ Error: "Cannot update diary" });
            });
    },

    getAllPatientDiaries: function (req, res, next) {
        debug("getAllPatientDiaries");

        Stats.UpdateRequestStat("Patient");
        return models.Diary.findAll({
            attributes: ["id", "content", "creation_date"],
            where: {
                patient_id: req.params.id
            },
            limit: 10,
            order: [["creation_date", "DESC"]]
        })
            .then(function (diaries) {
                return res.json(diaries);
            })
            .catch(next);
    },

    //********************** RECIPES **********************\\

    getAllRecipes: function (req, res, next) {
        debug("getAllRecipes");

        var whereQuery = {};

        if (req.body.data.recipe_type)
            whereQuery.recipe_type = req.body.data.recipe_type;
        if (req.body.data.diet)
            whereQuery.diet = 1;
        if (req.body.data.difficulty)
            whereQuery.difficulty = req.body.data.difficulty;
        if (req.body.data.recipe_cooking_time) {
            if (req.body.data.recipe_cooking_time == "quinze")
                whereQuery.recipe_cooking_time = { $lte: "00:15:00" };
            else if (req.body.data.recipe_cooking_time == "trente")
                whereQuery.recipe_cooking_time = { $lte: "00:30:00" };
            else if (req.body.data.recipe_cooking_time == "soixante")
                whereQuery.recipe_cooking_time = { $lte: "01:00:00" };
            else if (req.body.data.recipe_cooking_time == "supSoixante")
                whereQuery.recipe_cooking_time = { $gte: "01:00:00" };
        }
        if (req.body.data.nb_likes)
            whereQuery.nb_likes = { $gte: req.body.data.nb_likes };
        if (req.body.data.nameLike)
            whereQuery.name = { $like: '%' + req.body.data.nameLike + '%' };

        Stats.UpdateRequestStat("Patient");
        return models.Recipes.findAll({
            attributes: ["id", "name", "nb_cal", "image", "nb_likes"],
            where: whereQuery,
            offset: parseInt(req.body.offset),
            limit: 5,
            order: [
                ['nb_likes', 'DESC'],
            ],
            logging: notOnlyALogger
        })
            .then(function (recipes) {
                debug(recipes);
                return res.json(recipes);
            })
            .catch(next);
    },

    getAllRecipesNames: function (req, res, next) {
        debug("getAllRecipesNames");

        Stats.UpdateRequestStat("Patient");
        return models.Recipes.findAll({
            attributes: ["id", "name", "nb_cal"]
        })
            .then(function (recipes) {
                return res.json(recipes);
            })
            .catch(next);
    },

    //********************** RECIPES FAVORITE **********************\\

    getAllFavoriteRecipes: function (req, res, next) {
        debug("getAllFavoriteRecipes");

        var whereQuery = {};

        if (req.body.data.recipe_type)
            whereQuery.recipe_type = req.body.data.recipe_type;
        if (req.body.data.diet)
            whereQuery.diet = 1;
        if (req.body.data.difficulty)
            whereQuery.difficulty = req.body.data.difficulty;
        if (req.body.data.recipe_cooking_time) {
            if (req.body.data.recipe_cooking_time == "quinze")
                whereQuery.recipe_cooking_time = { $lte: "00:15:00" };
            else if (req.body.data.recipe_cooking_time == "trente")
                whereQuery.recipe_cooking_time = { $lte: "00:30:00" };
            else if (req.body.data.recipe_cooking_time == "soixante")
                whereQuery.recipe_cooking_time = { $lte: "01:00:00" };
        }
        if (req.body.data.nb_likes)
            whereQuery.nb_likes = { $gte: req.body.data.nb_likes };
        if (req.body.data.nameLike)
            whereQuery.name = { $like: '%' + req.body.data.nameLike + '%' };

        Stats.UpdateRequestStat("Patient");
        id_patient = req.body.patient_id;

        return models.Recipes.findAll({
            attributes: ["id", "name", "nb_cal", "nb_likes", "image"],
            where: whereQuery,
            offset: parseInt(req.body.offset),
            limit: 5,
            include: [
                {
                    model: models.Fav_recipes,
                    required: true,
                    include: [
                        {
                            model: models.Patient,
                            required: true
                        }
                    ]
                }
            ]
        })
            .then(function (recipes) {
                return res.json(recipes);
            })
            .catch(next);
    },

    getMostLikedRecipes: function (req, res, next) {
        debug("getMostLikedRecipes");

        return models.Recipes.findAll({
            attributes: ["id", "name", "nb_cal", "nb_likes", "image"],
            order: [["nb_likes", 'DESC']],
            limit: 5,
        })
            .then(function (recipes) {
                return res.json(recipes);
            })
            .catch(next);
    },

    addRecipeToFavorite: function (req, res, next) {
        debug("addRecipeToFavorite");

        Stats.UpdateRequestStat("Patient");
        id_patient = req.body.patient_id;
        id_recipe = req.body.recipe_id;

        return models.Fav_recipes.create({
            patient_id: id_patient,
            recipe_id: id_recipe
        })
            .then(function () {
                return res.status(201).json("Added to favorite");
            })
            .catch(function (err) {
                console.log("Error adding recipe to favorite");
                console.log("Log : " + err);
                Logs.LogError(500, "addRecipeToFavorite Patient : " + err)
                return res.status(500).json({ error: "cannot add recipe" });
            });
    },

    removeRecipeFromFavorite: function (req, res, next) {
        debug("removeRecipeFromFavorite");

        Stats.UpdateRequestStat("Patient");
        id_patient = req.body.patient_id;
        id_recipe = req.body.recipe_id;

        return models.Fav_recipes.destroy({
            where: {
                recipe_id: id_recipe
            }
        })
            .then(function () {
                return res.status(200).json("Removed from favorite");
            })
            .catch(function (err) {
                console.log("Error adding recipe to favorite");
                console.log("Log : " + err);
                Logs.LogError(500, "removeRecipeFromFavorite Patient : " + err)
                return res.status(500).json({ error: "cannot add recipe" });
            });
    },

    isRecipeFavorite: function (req, res, next) {
        debug("isRecipeFavorite");

        Stats.UpdateRequestStat("Patient");
        id_patient = req.body.patient_id;
        id_recipe = req.body.recipe_id;

        return models.Fav_recipes.findOne({
            where: {
                patient_id: id_patient,
                recipe_id: id_recipe
            }
        })
            .then(function (recipe) {
                if (!recipe) {
                    return res.status(200).json({ Response: false });
                } else if (recipe) {
                    return res.status(200).json({ Response: true });
                }
            })
            .catch(next);
    },

    //********************** RECIPES DETAIL **********************\\
    getRecipeDetails: function (req, res, next) {
        debug("getRecipeDetails");

        Stats.UpdateRequestStat("Patient");
        return models.Recipes.findOne({
            attributes: [
                "id",
                "name",
                "nb_cal",
                "ingredients",
                "description",
                "image",
                "nb_likes",
                "recipe_cooking_time",
                "recipe_type",
                "diet",
                "difficulty"
            ],
            where: {
                id: req.params.id
            }
        })
            .then(function (recipes) {
                debug(recipes);
                return res.json(recipes);
            })
            .catch(next);
    },

    isRecipeLiked: function (req, res, next) {
        debug("isRecipeLiked");

        id_patient = req.body.patient_id;
        id_recipe = req.body.recipe_id;
        Stats.UpdateRequestStat("Patient");
        models.Patient_Likes.findOne({
            where: {
                patient_id: id_patient,
                recipe_id: id_recipe
            }
        }).then(result => {
            return models.Recipes.findOne({
                where: {
                    id: id_recipe
                }
            })
                .then(recipe => {
                    return recipe.increment('nb_likes');
                })
                .catch(next);
        })
            .catch(next);
    },

    likeRecipe: function (req, res, next) {
        debug("likeRecipe");

        Stats.UpdateRequestStat("Patient");
        id_patient = req.body.patient_id;
        id_recipe = req.body.recipe_id;

        debug("whut1");
        models.Patient_Likes.create({
            patient_id: id_patient,
            recipe_id: id_recipe
        }).then(function () {
            debug("finding recipe");
            models.Recipes.findOne({
                where: {
                    id: id_recipe
                }
            }).then(recipe => {
                debug("incrementing recipe");
                return recipe.increment("nb_likes");
            }).then(result => {
                return res.status(201).json("Liked");
            })
        })
            .catch(function (err) {
                debug("error");
            console.log("Error liking recipe");
            console.log("Log : " + err);
            Logs.LogError(500, "likeRecipe Patient : " + err)
            return res.status(500).json({ error: "cannot like recipe" });
        });
    },

    unlikeRecipe: function (req, res, next) {
        debug("unlikeRecipe");

        Stats.UpdateRequestStat("Patient");
        id_patient = req.body.patient_id;
        id_recipe = req.body.recipe_id;

        debug("whut2");
        return models.Patient_Likes.destroy({
            where: {
                recipe_id: id_recipe
            }
        }).then(function () {
            debug("finding recipe");
            models.Recipes.findOne({
                where: {
                    id: id_recipe
                }
            }).then(recipe => {
                debug("decrementing recipe");
                return recipe.decrement("nb_likes");
            }).then(result => {
                return res.status(201).json("Unliked");
            })
        })
            .catch(function (err) {
                debug("error2");
            console.log("Error unliking recipe");
            console.log("Log : " + err);
            Logs.LogError(500, "likeRecipe Patient : " + err)
            return res.status(500).json({ error: "cannot unlike recipe" });
        });
    },

    isRecipeLiked: function (req, res, next) {
        debug("isRecipeLiked");

        Stats.UpdateRequestStat("Patient");
        id_patient = req.body.patient_id;
        id_recipe = req.body.recipe_id;

        return models.Patient_Likes.findOne({
            where: {
                patient_id: id_patient,
                recipe_id: id_recipe
            }
        })
            .then(function (liked) {
                if (!liked) {
                    return res.status(200).json({ Response: false });
                } else if (liked) {
                    return res.status(200).json({ Response: true });
                }
            })
            .catch(next);
    },

    //********************** MUSIQUE **********************\\

    spotifyAuthorize: function (req, res, next) {
        debug("spotifyAuthorize");

        Stats.UpdateRequestStat("Patient");

        console.log(req.body);

        var scopes = 'user-read-private user-read-email user-read-recently-played playlist-read-private playlist-read-collaborative user-top-read';

        var output = "";

        https.get('https://accounts.spotify.com/authorize' +
            '?response_type=code' +
            '&client_id=' + client_id +
            (scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
            '&redirect_uri=' + encodeURIComponent(req.body.redirect_uri), (resp) => {
                let data = '';
                console.log("Res : ", resp);
                console.log('Status Code:', resp.statusCode);
                return res.status(200).json(resp.headers["location"]);

                res.on('data', (d) => {
                    console.log("Data obtained");
                    output += d;
                    process.stdout.write(d);
                });

                res.on('end', (d) => {
                    console.log("End : ", output);
                    return res.status(200).json(output);
                })

            }).on('error', (e) => {
                return res.status(500).json(e);
            })
    },

    spotifyGetAuthorizationCode: function (req, res, next) {
        debug("spotifyGetAuthorizationCode");

        Stats.UpdateRequestStat("Patient");

        var redirect_uri = req.body.redirect_uri;
        var code = req.body.code;
        var data = "grant_type=authorization_code&code=" +
            encodeURIComponent(code) +
            "&redirect_uri=" + encodeURIComponent(redirect_uri);

        var optionsCode = {
            host: "accounts.spotify.com",
            path: "/api/token",
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": "Basic " + Buffer.from(client_id + ":" + client_secret).toString('base64')
            }
        };

        var output = '';

        req = https.request(optionsCode, (result) => {
            console.log('statusCode:', result.statusCode);
            console.log('headers:', result.headers);

            result.on('data', (d) => {
                console.log("Data obtained");
                process.stdout.write(d);
                output += d;
            });

            result.on('end', (d) => {
                console.log("End : ", output);
                return res.status(200).json(output);
            });
        });

        req.on('error', (e) => {
            console.log("error");
            return res.status(500).json(e);
        });

        req.write(data);
        req.end();
    },

    spotifyRefreshToken: function (req, res, next) {
        debug("spotifyRefreshToken");

        var refresh_token = req.body.refresh_token;

        var optionsCode = {
            host: "accounts.spotify.com",
            path: "/api/token",
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": "Basic " + Buffer.from(client_id + ":" + client_secret).toString('base64')
            }
        };

        var data = "grant_type=refresh_token&refresh_token=" +
            encodeURIComponent(refresh_token);

        var output = '';

        req = https.request(optionsCode, (result) => {
            console.log('statusCode:', result.statusCode);
            console.log('headers:', result.headers);

            result.on('data', (d) => {
                console.log("Data obtained");
                process.stdout.write(d);
                output += d;
            });

            result.on('end', (d) => {
                console.log("End : ", output);
                return res.status(200).json(output);
            });
        });

        req.on('error', (e) => {
            console.log("error");
            return res.status(500).json(e);
        });

        req.write(data);
        req.end();
    },

    spotifyGetUserInfo: function (req, res, next) {
        debug("spotifyGetUserInfo");

        console.log(req.params);
        var access_token = req.params.access_token;

        var optionsCode = {
            host: "api.spotify.com",
            path: "/v1/me",
            method: "GET",
            headers: {
                "Authorization": "Bearer " + access_token
            }
        };

        var output = '';

        req = https.request(optionsCode, (result) => {
            console.log('statusCode:', result.statusCode);
            console.log('headers:', result.headers);

            result.on('data', (d) => {
                console.log("Data obtained");
                process.stdout.write(d);
                output += d;
            });

            result.on('end', (d) => {
                console.log("End : ", output);
                return res.status(200).json(output);
            });
        });

        req.on('error', (e) => {
            console.log("error");
            return res.status(500).json(e);
        });
        req.end();

    },

    //********************** SEANCE **********************\\

    getSeanceInProgress: function (req, res, next) {
        debug("getSeanceInProgress");
        id_patient = req.params.id;

        Stats.UpdateRequestStat("Patient");
        return models.Sessions.findOne({
            where: {
                patient_id: id_patient,
                status: "En cours",
                creation_date: {
                    $between: [new Date(new Date() - 24 * 60 * 60 * 1000).toISOString().replace(/T/, ' ').replace(/\..+/, ''), new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')]
                }
            },
            order: [["creation_date", "DESC"]]
        })
            .then(function (seance) {
                return res.json(seance);
            })
            .catch(next);
    },

    getSeanceData: function (req, res, next) {
        debug("getSeanceData");
        //console.log("getseancedata");

        Stats.UpdateRequestStat("Patient");
        var id_seance = req.params.id;

        models.Sessions.findOne({
            where: {
                id: id_seance
            }
        })
            .then(function (seance) {
                models.Session_moods.findAll({
                    where: {
                        sessions_id: id_seance
                    }
                })
                    .then(function (moods) {
                        //          console.log(moods);
                        //        console.log(seance);
                        var data = {
                            moods: moods,
                            seance: seance
                        };
                        //console.log(data);
                        return res.json(data);
                    })
            })
            .catch(function (err) {
                console.log("Couldn't retrieve session");
                console.log("Log : " + err);
                Logs.LogError(500, "getSeanceData Patient : " + err)
                return res.status(500).json({ error: "Couldn't retrieve session" });
            });
    },

    sendSeanceData1: function (req, res, next) {
        debug("postSeanceData1");

        Stats.UpdateRequestStat("Patient");
        var patient_id = req.body.patient_id;
        var text_situation = req.body.seanceData.TextSituation;
        var seance_id = req.body.seanceData.id;

        return models.Sessions.update({
            text_situation: text_situation
        },
            {
                where: {
                    patient_id: patient_id,
                    id: seance_id
                }
            })
            .then(function (data) {
                return res.status(200).json({ Message: "Information sent" });
            })
            .catch(function (err) {
                console.log("Error add seance");
                console.log("Log : " + err);
                Logs.LogError(500, "sendSeanceData1 Patient : " + err)
                return res.status(500).json({ error: "cannot add seance" });
            });
    },

    sendSeanceData2: function (req, res, next) {
        debug("postSeanceData2");
        console.log("postSeanceData2")

        Stats.UpdateRequestStat("Patient");
        var patient_id = req.body.patient_id;
        var seance_id = req.body.seanceData.id;
        var TextAutomaticThinking = req.body.seanceData.TextAutomaticThinking;
        var AutomaticThinkingDegree = req.body.seanceData.AutomaticThinkingDegree;

        return models.Sessions.update({
            text_automatic: TextAutomaticThinking,
            automatic_global_degree: AutomaticThinkingDegree
        },
            {
                where: {
                    patient_id: patient_id,
                    id: seance_id
                }
            })
            .then(function (data) {
                return res.status(200).json({ Message: "Information sent" });
            })
            .catch(function (err) {
                console.log("Error add seance");
                console.log("Log : " + err);
                Logs.LogError(500, "sendSeanceData2 Patient : " + err)
                return res.status(500).json({ error: "cannot add seance" });
            });
    },

    sendSeanceData3: function (req, res, next) {
        debug("postSeanceData3");
        console.log("postSeanceData3")

        Stats.UpdateRequestStat("Patient");
        var patient_id = req.body.patient_id;
        var seance_id = req.body.seanceData.id;
        var MoodGlobalDegree = req.body.seanceData.MoodGlobalDegree;

        models.Session_moods.destroy({
            where: {
                sessions_id: seance_id
            }
        })
            .then(function () {
                for (var i = 0; i < MoodGlobalDegree.length; i++) {
                    models.Session_moods.upsert({
                        sessions_id: seance_id,
                        mood_name: MoodGlobalDegree[i][0],
                        mood_degree: MoodGlobalDegree[i][1]
                    });
                }
                return res.status(200).json({ Message: "Information sent" });
            })
    },

    sendSeanceData4: function (req, res, next) {
        debug("postSeanceData4");
        console.log("postSeanceData4")

        Stats.UpdateRequestStat("Patient");
        var patient_id = req.body.patient_id;
        var seance_id = req.body.seanceData.id;
        var TextRationalAnswer = req.body.seanceData.TextRationalAnswer;
        var RationalAnswerDegree = req.body.seanceData.RationalAnswerDegree;

        return models.Sessions.update({
            text_rational: TextRationalAnswer,
            rational_global_degree: RationalAnswerDegree
        },
            {
                where: {
                    patient_id: patient_id,
                    id: seance_id
                }
            })
            .then(function (data) {
                console.log("ok");
                return res.status(200).json({ Message: "Information sent" });
            })
            .catch(function (err) {
                console.log("Error add seance");
                console.log("Log : " + err);
                Logs.LogError(500, "sendSeanceData4 Patient : " + err)
                return res.status(500).json({ error: "cannot add seance" });
            });
    },

    sendSeanceData5: function (req, res, next) {
        debug("postSeanceData5");
        console.log("postSeanceData5")

        Stats.UpdateRequestStat("Patient");
        var patient_id = req.body.patient_id;
        var seance_id = req.body.seanceData.id;
        var TextResult = req.body.seanceData.TextResult;
        var ResultGlobalDegree = req.body.seanceData.ResultGlobalDegree;

        return models.Sessions.update({
            text_result: TextResult,
            result_global_degree: ResultGlobalDegree,
            status: "Fini"
        },
            {
                where: {
                    patient_id: patient_id,
                    id: seance_id
                }
            })
            .then(function () {
                return res.status(200).json({ Message: "Information sent" });
            })
            .catch(function (err) {
                console.log("Error add seance");
                console.log("Log : " + err);
                Logs.LogError(500, "sendSeanceData5 Patient : " + err)
                return res.status(500).json({ error: "cannot add seance" });
            });
    },

    //********************** OBJECTIVES **********************\\

    sendNotificationData: function (req, res, next) {
        debug("sendNotificationData");

        Stats.UpdateRequestStat("Patient");
        const id_patient = req.body.patient_id;
        const content = req.body.content;
        const value = req.body.value;
        const type = req.body.type;
        const dateVar = new Date();

        return models.Objectives.findOne({
            where: {
                patient_id: id_patient,
                due_date: { $gte: dateVar }
            },
            order: [["due_date", "ASC"]]
        })
            .then(data => {
                models.Notifs_Answers.create({
                    content: content,
                    objectives_id: data.dataValues["id"]
                });

                let newVal = parseInt(data.dataValues[type]) + parseInt(value);

                if (type === "nb_sleep") {
                    return data
                        .update({
                            nb_sleep: newVal
                        })
                        .then(function (record) {
                            return res.status(200).json("Data sent");
                        })
                        .catch(function (err) {
                            debug("Log : " + err);
                            Logs.LogError(500, "sendNotificationData Patient : " + err)
                            return res.status(500).json({
                                Error: "Une erreur est survenue dans la base de données"
                            });
                        });
                } else if (type === "nb_cal") {
                    return data
                        .update({
                            nb_cal: newVal
                        })
                        .then(function (record) {
                            return res.status(200).json("Data sent");
                        })
                        .catch(function (err) {
                            debug("Error sending notification to server");
                            debug("Log : " + err);
                            Logs.LogError(500, "sendNotificationData Patient : " + err)
                            return res.status(500).json({
                                Error: "Une erreur est survenue dans la base de données"
                            });
                        });
                } else if (type === "nb_sport") {
                    return data
                        .update({
                            nb_sport: newVal
                        })
                        .then(function (record) {
                            return res.status(200).json("Data sent");
                        })
                        .catch(function (err) {
                            debug("Error sending notification to server");
                            debug("Log : " + err);
                            Logs.LogError(500, "sendNotificationData Patient : " + err)
                            return res.status(500).json({
                                Error: "Une erreur est survenue dans la base de données"
                            });
                        });
                }
            })
            .catch(function (err) {
                debug("Log : " + err);
                Logs.LogError(500, "sendNotificationData Patient : " + err)
                return res
                    .status(500)
                    .json({ Error: "Impossible de joindre le serveur" });
            });
    },

    getObjectivesByPatient: function (req, res, next) {
        debug("getObjectivesByPatient");

        Stats.UpdateRequestStat("Patient");
        return models.Patient.findById(req.params.id)
            .then(function (objectives) {
                return res.json(objectives);
            })
            .catch(next);
    },

    getCurrentObjective: function (req, res, next) {
        debug("getCurrentObjective");

        Stats.UpdateRequestStat("Patient");
        const id_patient = req.params.id;
        const dateVar = new Date();

        return models.Objectives.findOne({
            attributes: [
                "patient_id",
                "obj_sleep",
                "obj_cal",
                "obj_sport",
                "nb_sleep",
                "nb_cal",
                "nb_sport",
                "due_date",
                "creation_date"],
            where: {
                patient_id: id_patient,
                due_date: { $gte: dateVar }
            }
        })
            .then(obj => {
                debug(obj);
                return res.json(obj);
            })
            .catch(function (err) {
                debug("Log : " + err);
                Logs.LogError(500, "getCurrentObjective Patient : " + err)
                return res
                    .status(500)
                    .json({ Error: "Impossible de joindre le serveur" });
            });
    },

    getTodayObjSport: function (req, res, next) {
        debug("getTodayObjSport");
        const dateToday = new Date();
        dateToday.setHours(0,0,0,0);
        const dateTomorrow = new Date(dateToday);
        dateTomorrow.setDate(dateToday.getDate() + 1);
        return models.Obj_sport.findAll({
            where: {patient_id: req.params.id, creation_date: {
                $gte: dateToday, $lt: dateTomorrow
                }}})
            .then(obj_sports => { return res.json(obj_sports)})
            .catch(next);
    },

    addObjSport: function (req, res) {
        debug("addObjSport");

        return models.Obj_sport.create({
            description: req.body.description,
            patient_id: req.body.id,
            duration: req.body.duration,
            is_finished: false,
            reporting_date: new Date()
        })
            .then(function () {
                return res.status(201).json("ok");
            })
            .catch(function (err) {
                debug("Error create obj_sport Patient - " + err);
                Logs.LogError(500, "Create obj_sport : " + err)
                return res.status(500).json({ error: "cannot add  obj_sport entry" });
            });
    },

    setObjSportToDone: function (req, res, next) {
        debug("setObjSportToDone");
        console.log(req.body);
        return models.Obj_sport.update({ is_finished: true }, {
            where: { id: req.body.obj.id }
        })
            .then(() => {
                const today = new Date();
                return models.Objectives.findOne({
                    where: {
                        patient_id: req.body.patient_id,
                        due_date: { $gte: today }
                    },
                    order: [["due_date", "ASC"]]
                }).then(obj => {
                    if (obj) {
                        console.log(obj);
                        obj.update({ nb_sport: parseInt(obj.dataValues['nb_sport']) + parseInt(req.body.obj.duration) }).then(() => {
                            return res.status(200).json("Data sent");
                        })
                            .catch(function (err) {
                                debug("Log : " + err);
                                Logs.LogError(500, "sendNotificationData Patient : " + err)
                                return res.status(500).json({
                                    Error: "Une erreur est survenue dans la base de données"
                                });
                            });
                    }
                })
            })
            .catch(next);
    },

    deleteObjSport: function (req, res, next) {
        debug("deleteObjSport");
        console.log(req.params.id);
        return models.Obj_sport.destroy({
            where: { id: req.params.id }
        })
            .then(result => res.json(result))
            .catch(next);
    },

    getTodayObjMeal: function (req, res, next) {
        debug("getTodayObjMeal");
        const dateToday = new Date();
        dateToday.setHours(0,0,0,0);
        const dateTomorrow = new Date(dateToday);
        dateTomorrow.setDate(dateToday.getDate() + 1);

        return models.Obj_meal.findAll({
            where: { patient_id: req.params.id, creation_date: {
                    $gte: dateToday, $lt: dateTomorrow
                } }
        })
            .then(obj_meals => { return res.json(obj_meals) })
            .catch(next);
    },

    addObjMeal: function (req, res) {
        debug("addObjMeal");

        return models.Obj_meal.create({
            description: req.body.description,
            patient_id: req.body.id,
            calories: req.body.calories,
            is_finished: false,
            reporting_date: new Date()
        })
            .then(function () {
                return res.status(201).json("ok");
            })
            .catch(function (err) {
                debug("Error create obj_meal Patient - " + err);
                Logs.LogError(500, "Create obj_meal : " + err);
                return res.status(500).json({ error: "cannot add  obj_meal entry" });
            });
    },

    setObjMealToDone: function (req, res, next) {
        debug("setObjMealToDone");
        console.log(req.body);
        return models.Obj_meal.update({is_finished: true}, {
            where: {id: req.body.obj.id}})
            .then(() => {
                const today = new Date();
                return models.Objectives.findOne({
                    where: {
                        patient_id: req.body.patient_id,
                        due_date: { $gte: today }
                    },
                    order: [["due_date", "ASC"]]
                }).then(obj => {
                    if (obj) {
                        obj.update({nb_cal : parseInt(obj.dataValues['nb_cal']) + parseInt(req.body.obj.calories)}).then(() => {
                            return res.status(200).json("Data sent");
                        })
                            .catch(function (err) {
                                debug("Log : " + err);
                                Logs.LogError(500, "sendNotificationData Patient : "+ err);
                                return res.status(500).json({
                                    Error: "Une erreur est survenue dans la base de données"
                                });
                            });
                    }
                })
            })
            .catch(next);
    },

    deleteObjMeal: function (req, res, next) {
        debug("deleteObjMeal");
        return models.Obj_meal.destroy({
            where: { id: req.params.id }
        })
            .then(result => res.json(result))
            .catch(next);
    },

    addObjOther: function (req, res) {
        debug("addObjOther");

        return models.Obj_sport.create({
            description: req.body.description,
            patient_id: req.body.id,
            duration: 0,
            is_finished: false,
            reporting_date: new Date()
        })
            .then(function () {
                return res.status(201).json("ok");
            })
            .catch(function (err) {
                debug("Error create obj_sport Patient - " + err);
                Logs.LogError(500, "Create obj_other : " + err)
                return res.status(500).json({ error: "cannot add obj_other entry" });
            });
    },

    //********************** BUG REPORT **********************\\

    send: function (req, res, next) {
        debug("send");

        Stats.UpdateRequestStat("Patient");
        if (req.body.id == null) {
            Logs.LogError("400", "Send patient bug report : missing parameters");
            return res.status(400).json({ error: "missing parameters" });
        }
        try {
            var contents = fs.readFileSync(
                "ressources/mails/bug_report/patient-report.html.twig",
                "utf8"
            );
        } catch (err) {
            console.log("ici");
            Logs.LogError(500, "Send Patient : " + err)
            Logs.LogError("500", "GetLogsFromDate : " + err);
        }
        models.Patient.findOne({
            attributes: ["email"],
            where: { id: req.body.id }
        })
            .then(function (PatientFound) {
                if (PatientFound) {
                    var mail = Twig.twig({ data: contents, async: false }).render({
                        explication: req.body.explain,
                        cheminement: req.body.cheminement,
                        anonymous: req.body.anonymous,
                        email: PatientFound.email,
                        date: moment().format("DD-MM-YYYY HH:mm")
                    });
                    var transporter = mailer.createTransport({
                        service: "Gmail",
                        auth: {
                            user: "contact.mandareen@gmail.com",
                            pass: "20ManDa1reEn8"
                        },
                        tls: {
                            rejectUnauthorized: false
                        }
                    });
                    var mail = {
                        from: "contact.mandareen@gmail.com",
                        to: "contact.mandareen@gmail.com",
                        subject: "[No-Reply] Bug Report - PATIENT",
                        html: mail
                    };
                    transporter.sendMail(mail, function (error, response) {
                        if (error) {
                            state = "err";
                            Logs.LogError("500", "Send patient bug report : " + err);
                            return res.status(500).json({ error: "Send mail failed" });
                        } else {
                            state = "ok";
                            return res.status(200).json({ message: "email send" });
                        }
                    });
                } else {
                    Logs.LogError("404", "Patient not found");
                    return res.status(404).json({ error: "patient not exist in DB" });
                }
            })
            .catch(function (err) {
                Logs.LogError("500", "Send patient bug report : " + err);
                return res.status(500).json({ error: "unable to verify patient" });
            });
    },
};
