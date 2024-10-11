var util = require("util");

function MandareenError() {
    Error.captureStackTrace(this, MandareenError);
    this.name = "MandareenError";
    this.flag = "MandareenError_flag";
    this.message = "MandareenError_message";
    this.statusCode = 404;
}

util.inherits(MandareenError, Error);
exports.MandareenError = MandareenError;


function NotFound(message) {
    MandareenError.call(this);
    this.name = "NotFound";
    this.flag = "NOT_FOUND";
    this.message = message || "";
    this.statusCode = 404;
}

util.inherits(NotFound, MandareenError);
exports.NotFound = NotFound;


function InvalidAction(flag) {
    MandareenError.call(this);
    this.name = "NotFound";
    this.flag = flag;
    this.statusCode = 404;
}

util.inherits(InvalidAction, MandareenError);
exports.NotFound = InvalidAction;


function Db(message) {
    MandareenError.call(this);
    this.name = "Db";
    this.flag = "DB_ERROR";
    this.message = message || "";
    this.statusCode = 500;
}

util.inherits(Db, MandareenError);
exports.Db = Db;


function Sequelize(err) {
    MandareenError.call(this);
    this.name = "Sequelize";
    this.flag = "SEQUELIZE_ERROR_" + err.name;
    this.message = "Sequelize error: " + err.message || "";
    this.statusCode = 500;
    if(err.errors && err.errors[0].path) {
        this.flag += "_" + err.errors[0].path;
    }
}

util.inherits(Sequelize, MandareenError);
exports.Sequelize = Sequelize;

function Sendinblue(err) {
    MandareenError.call(this);
    this.name = "Sendinblue";
    this.flag = "SENDINBLUE_ERROR_" + err.message;
    this.message = "Sendinblue error: " + err.code;
    this.statusCode = 500;
}

util.inherits(Sendinblue, MandareenError);
exports.Sendinblue = Sendinblue;

function Demo() {
    MandareenError.call(this);
    this.name = "DEMO_MODE";
    this.flag = "DEMO_MODE";
    this.message = "Mode Demo";
    this.statusCode = 500;
}

util.inherits(Demo, MandareenError);
exports.Demo = Demo;

function Stripe(err) {
    MandareenError.call(this);
    this.name = "Stripe";
    this.flag = "STRIPE_ERROR_" + err.type;
    this.type = err.rawType;
    this.param = err.param;
    this.code = err.code;
    this.statusCode = 500;
    const MESSAGES = {
        'api_connection_error': 'Erreur de connection. Vérifiez que vous êtes bien connecté et rééssayez.',
        'api_error': 'Une erreur s\'est produite sur le serveur de la banque. Veuillez retenter prochainement.',
        'authentication_error': 'Erreur d\'authentification. Vérifiez que vous êtes bien authentifié(e).',
        'invalid_request_error': 'Certains paramètres sont manquants. Veuillez les vérifier.',
        'rate_limit_error': 'Trop de requêtes ont été passées dans le temps. Veuillez patienter avant de retenter.',
        'card_error': {
            'invalid_number': 'Le numéro de carte banquaire n\'est pas valide.',
            'invalid_expiry_month': 'Le mois de la date d\'expiration n\'est pas valide.',
            'invalid_expiry_year': 'L\'année de la date d\'expiration n\'est pas valide.',
            'invalid_cvc': 'Le code de vérification de la carte n\'est pas valide. C\'est un code à trois chiffres situé au dos de la carte.',
            'incorrect_number': 'Le numéro de la carte n\'est pas correct.',
            'expired_card': 'La carte a expiré.',
            'incorrect_cvc': 'Le code de vérification de la carte est incorrect. C\'est un code à trois chiffres situé au dos de la carte.',
            'incorrect_zip': 'Le code postal de la carte n\'est pas correct.',
            'card_declined': 'La carte a été refusée par la banque.',
            'missing': 'Vous n\'avez pas indiqué de carte de paiement.',
            'processing_error': 'Une erreur s\'est produite lors du traitement de la carte.'
        }
    };

    if(this.type in MESSAGES) {
        if(this.type === 'card_error') {
            if(this.code in MESSAGES.card_error) {
                this.message = MESSAGES.card_error[this.code];
            } else {
                this.message = "Une erreur inconnue s'est produite lors de l'enregistrement de la carte."
            }
        } else {
            this.message = MESSAGES[err.rawType];
        }
    } else {
        this.message = "Une erreur inconnue s'est produite lors de la communication avec le service de paiement.";
    }
}

util.inherits(Stripe, MandareenError);
exports.Stripe = Stripe;


function MissingParams(flag) {
    MandareenError.call(this);
    this.name = "MissingParams";
    this.flag = "MISSING_PARAM_" + flag;
    this.message = this.flag;
    this.statusCode = 400;
}

util.inherits(MissingParams, MandareenError);
exports.MissingParams = MissingParams;


function InvalidParam(param, value) {
    MandareenError.call(this);
    this.name = "InvalidParam";
    this.flag = "INVALID_PARAM_" + param;
    this.message = "The parameter " + param + " has an invalid value of \"" + value + "\"";
    this.statusCode = 400;
}

util.inherits(InvalidParam, MandareenError);
exports.InvalidParam = InvalidParam;


function IncorrectParam(flag, message) {
    MandareenError.call(this);
    this.name = "IncorrectParam";
    this.flag = "INCORRECT_PARAM_" + flag;
    this.message = message;
    this.statusCode = 400;
}

util.inherits(IncorrectParam, MandareenError);
exports.IncorrectParam = IncorrectParam;


function AlgorithmError(flag) {
    MandareenError.call(this);
    this.name = "AlgorithmError";
    this.flag = "ALGORITHM_ERROR_" + flag;
    this.message = this.flag;
    this.statusCode = 400;
}

util.inherits(AlgorithmError, MandareenError);
exports.AlgorithmError = AlgorithmError;


function AuthFailed(flag) {
    MandareenError.call(this);
    this.name = "AuthFailed";
    this.flag = "AUTH_FAILED_" + flag;
    this.message = this.flag;
    this.statusCode = 401;
}

util.inherits(AuthFailed, MandareenError);
exports.AuthFailed = AuthFailed;


function PassportFailed() {
    MandareenError.call(this);
    this.name = "PassportFailed";
    this.flag = "PASSPORT_FAILED";
    this.message = this.flag;
    this.statusCode = 401;
}

util.inherits(PassportFailed, MandareenError);
exports.PassportFailed = PassportFailed;


function Unique(flag) {
    MandareenError.call(this);
    this.name = "Unique";
    this.flag = "UNIQUE_" + flag;
    this.message = this.flag;
    this.statusCode = 400;
}

util.inherits(Unique, MandareenError);
exports.Unique = Unique;


function Geocode(message, flag) {
    MandareenError.call(this);
    this.name = "Geocode";
    this.flag = flag || "GEOCODE_ERR";
    this.message = message || "";
    this.statusCode = 400;
}

util.inherits(Geocode, MandareenError);
exports.Geocode = Geocode;

function Frames(flag) {
    MandareenError.call(this);
    this.name = "Frames";
    this.flag = "FRAMES_" + flag;
    this.statusCode = 400;
    this.message = this.flag;
}

util.inherits(Frames, MandareenError);
exports.Frames = Frames;


function Mail(message, flag) {
    MandareenError.call(this);
    this.name = "Mail";
    this.flag = flag || "MAIL_ERR";
    this.message = message || "";
    this.statusCode = 500;
}

util.inherits(Mail, MandareenError);
exports.Mail = Mail;
