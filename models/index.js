'use strict';

const debug = require("debug")("app:models:sequelize");
const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const env = process.env.NODE_ENV || "development";
const config = require("../config");


const models = {};
let sequelize = null;
initSequelize();
loadModels();
associateModels();

models.sequelize = sequelize;
models.Sequelize = Sequelize;
models.Op = Sequelize.Op;
module.exports = models;


function initSequelize() {
    const cls = require("continuation-local-storage");
    const namespace = cls.createNamespace("mandareen");
    Sequelize.useCLS(namespace);
    sequelize = new Sequelize(
        config.development.database,
        config.development.username,
        config.development.password,
        {
            dialect: config.development.dialect,
            define: { underscored: true },
            logging: config.development.logging,
            host: config.development.host,
            maxConcurrentQueries: config.development.connectionLimit
        }
    )
    if (env === "test") {
        sequelize.connectionManager.config.database = "mandareen_test";
        sequelize.connectionManager.pool.clear();
    }
    sequelize
        .authenticate()
        .then(() => {
            console.log('Database connection has been established successfully.');
        })
        .catch(err => {
            console.error('Unable to connect to the database');
            process.exit(1);
        });
}

function loadModels() {
    models.Admin = sequelize["import"](path.join(__dirname, "./admin"));
    models.Care = sequelize["import"](path.join(__dirname, "./care"));
    models.Device = sequelize["import"](path.join(__dirname, "./device"));
    models.Diary = sequelize["import"](path.join(__dirname, "./diary"));
    models.Fav_recipes = sequelize["import"](path.join(__dirname, "./fav_recipes"));
    models.Followup = sequelize["import"](path.join(__dirname, "./followup"));
    models.Notifs_Answers = sequelize["import"](path.join(__dirname, "./notifs_answers"));
    models.Objectives = sequelize["import"](path.join(__dirname, "./objectives"));
    models.Patient = sequelize["import"](path.join(__dirname, "./patient"));
    models.Pro = sequelize["import"](path.join(__dirname, "./pro"));
    models.Recipes = sequelize["import"](path.join(__dirname, "./recipes"));
    models.Report_pro = sequelize["import"](path.join(__dirname, "./report_pro"));
    models.Stats = sequelize["import"](path.join(__dirname, "./stats"));
    models.Subscription = sequelize["import"](path.join(__dirname, "./subscription"));
    models.Subs_pro = sequelize["import"](path.join(__dirname, "./subs_pro"));
    models.Device = sequelize["import"](path.join(__dirname, "./device"));
    models.Sessions = sequelize["import"](path.join(__dirname, "./sessions"));
    models.Session_moods = sequelize["import"](path.join(__dirname, "./session_moods"));
    models.Session_recurr = sequelize["import"](path.join(__dirname, "./session_recurr"));
    models.GlobalStats = sequelize["import"](path.join(__dirname, "./global_stats"));
    models.StatsRequests = sequelize["import"](path.join(__dirname, "./stats_request"));
    models.Obj_meal = sequelize["import"](path.join(__dirname, "./obj_meal"));
    models.Obj_sport = sequelize["import"](path.join(__dirname, "./obj_sport"));
    models.Patient_Likes = sequelize["import"](path.join(__dirname, "./patient_likes"));
    models.Answer = sequelize["import"](path.join(__dirname, "./answer"));
    models.pro_bill = sequelize["import"](path.join(__dirname, "./pro_bill"));
}

function associateModels() {
    Object.keys(models).forEach(function (modelName) {
        if (models[modelName].associate) {
            models[modelName].associate(models);
        }
    });
}
