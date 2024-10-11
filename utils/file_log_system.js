var fs = require('fs');
var moment = require('moment');
var stat = require('./statistics');

// Les logs sont enregistrés dans 2 fichiers distincts : ERROR.log et logs_[mois]-[année]

module.exports = {
    // LogError permet d'enregistrer les erreurs serveur (err 500) et n'affiche pas l'IP de la requête
    LogError: function (code, string) {
        try {
        stat.UpdateErrorStat().then(function () {
            var output = "";
            output = getDateLog();
            output += " | " + code + " | " + string;
            WriteInFile("./LogsAPI/ERROR.log", output);
            WriteInFile("./LogsAPI/logs_" + moment().format("MM-YYYY") + ".log", output);
        });}
        catch(e){
            console.log("LogError Error: " + e);
            console.log("Error failed to be logged : " + code + " | " + string);
        }
    },
    // LogErrorIP permet d'enregistrer les erreurs et affiche l'IP de la requête
    LogErrorIP: function (req, code, string) {
        try {
        stat.UpdateErrorStat().then(function () {
            var output = "";
            output = getDateLog();
            output += " | " + code + " | " + string;
            WriteInFile("./LogsAPI/ERROR.log", output);
            WriteInFile("./LogsAPI/logs_" + moment().format("MM-YYYY") + ".log", output);
        });
    }
        catch (e) {
            console.log("LogErrorIP Error: " + e);
            console.log("Error failed to be logged : " + code + " | " + string);
        }
    },
    // LogSuccessIP permet d'enregistrer les commandes réussies et l'IP de la requête
    LogSuccessIP: function (req, code, string) {
        try {
        var output = "";
        output = getDateLog();
        output += " | " + code + " | " + string;
        WriteInFile("./LogsAPI/logs_" + moment().format("MM-YYYY") + ".log", output);
        }
        catch (e) {
            console.log("LogSuccessIP Error: " + e);
            console.log("Error failed to be logged : " + code + " | " + string);
        }
    },
    // Get logs from a date (month-year)
    GetLogsFromDate: function (date) {
        var logs = "err";
        try {
            var contents = fs.readFileSync('./LogsAPI/logs_' + date + ".log", 'utf8');
            var array = contents.split("\r\n");
            logs = array.filter(function (el) {
                return (el != "")
            });
        }
        catch (err) {
            this.LogError("500", "GetLogsFromDate : " + err);
        }
        return (logs);
    },
    GetLogsFromFile: function (file) {
        var logs = "err";
        try {
            var contents = fs.readFileSync('./LogsAPI/' + file, 'utf8');
            var array = contents.split("\r\n");
            logs = array.filter(function (el) {
                return (el != "")
            });
        }
        catch (err) {
            this.LogError("500", "GetLogsFromDate : " + err);
        }
        return (logs);
    },
    GetAllFilename() {
        try {
            var names = new Array();
            fs.readdirSync("./LogsAPI/").forEach(file => {
                if (!(file == "ERROR.log"))
                    names.push(file);
            });
            return names;
        }
        catch (e) {
            console.log(e);
            this.LogError("500", "GetAllFilename : " + e);
            return ("err")
        }
    }
}

function getDateLog() {
    return (moment().format("DD/MM/YYYY | HH:mm:ss"))
}

function WriteInFile(path, output) {
    try { fs.mkdirSync("./LogsAPI") }
    catch (err) {
        if (err.code !== 'EEXIST')
            throw err
    }
    var options = { flags: 'a+' }
    var wstream = fs.createWriteStream(path, options);
    wstream.write(output + '\r\n');
    wstream.end();
}