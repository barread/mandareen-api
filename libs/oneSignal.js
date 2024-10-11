const debug = require("debug")("app:OneSignal");
const config = require("../config");
const HttpsProxyAgent = require('https-proxy-agent');
const https = require('https');
const proxy = config.proxy;
const agent = proxy ? new HttpsProxyAgent(proxy) : false;
const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Authorization": "Basic ZWI2YTQ0YTctNTYxMy00NDAwLTg1YWMtMGMzZmQ3MGRmZDFi"
};

const options = {
    host: "onesignal.com",
    port: 443,
    path: "/api/v1/notifications",
    method: "POST",
    headers: headers,
    agent: agent
};


module.exports.sendNotification = function (body) {
    debug('send notification to');
    let message = {
        app_id: "486ca948-2f2d-4caa-a5ad-8c870021a4f0",
        contents: { "en": body.content },
        headings: { "en": "Mandareen" },
        include_player_ids: body.tokens,
        ios_badgeType: 'SetTo',
        content_available: true,
    };
    message.data = {};

    return new Promise((resolve, reject) => {
        let req = https.request(options, res => {
            let data = [];
            res.on(`data`, chunk => {
                data.push(chunk.toString(`utf8`));
            });
            res.on(`end`, () => {
                res.body = data.join(``);
                resolve(res);
            });
        });
        req.on(`error`, err => {
            reject(err);
        });
        if (body) {
            req.write(JSON.stringify(message));
        }
        req.end();
    });

};

module.exports.sendNotificationPrepared = function (body) {
    debug('send notification to');
    let message = {
        app_id: "486ca948-2f2d-4caa-a5ad-8c870021a4f0",
        contents: { "en": body.content },
        headings: { "en": body.title },
        include_player_ids: body.tokens,
        content_available: true,
    };
    message.data = {};
    message.data.type = body.type;

    return new Promise((resolve, reject) => {
        let req = https.request(options, res => {
            let data = [];
            res.on(`data`, chunk => {
                data.push(chunk.toString(`utf8`));
            });
            res.on(`end`, () => {
                res.body = data.join(``);
                resolve(res);
            });
        });
        req.on(`error`, err => {
            reject(err);
        });
        if (body) {
            req.write(JSON.stringify(message));
        }
        req.end();
    });

};



