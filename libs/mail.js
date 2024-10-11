const path = require("path");
const twig = require("twig");
const nodemailer = require("nodemailer");
const debug = require("debug")("app:libs:mail");
const config = require(path.resolve("./config"));
const errors = require("./errors");
const fs = require("fs");

const transporter = nodemailer.createTransport(config.smtp);

exports.send = function(template, input) {
    const mail = {
        from: input.from ? input.from : "L'équipe Mandareen <contact.mandareen@gmail.com>",
        to: input.to,
        subject: input.subject ? input.subject : "default subject",
        html: "",
        text: ""
    };
    debug(mail);

    if(!config.mails.send) {
        debug("Mail not sent because disabled in config file");
        return Promise.resolve();
    }

    return Promise.resolve()
    .then(addPDFAttachmentIfRequired)
    .then(setHTMLAndTextContent)
    .then(sendMail)
    .then(logSuccess)
    .catch(logFailure);

    function addPDFAttachmentIfRequired() {
        if(!input.pdf) { return; }
        let pdfStream = fs.createReadStream(input.pdf.path);

        mail.attachments = {
            filename: input.pdf.name,
            content: pdfStream,
            contentType: "application/pdf"
        };
    }

    function setHTMLAndTextContent() {
        return Promise.resolve()
        .then(() => setContentFromExtension("html"))
        .then(() => setContentFromExtension("txt"))
        .then(() => checkMailFound());
    }

    function setContentFromExtension(ext) {
        const filePath = path.resolve("./ressources/mails/" + template + "." + ext + ".twig");
        if(!fs.existsSync(filePath)) { return; }
        const format = ext === 'txt' ? 'text' : ext;
        return new Promise(function(resolve, reject) {
            twig.renderFile(filePath, input, function(err, results) {
                if(err) { reject(err); }
                mail[format] = results || "";
                resolve();
            });
        })
    }

    function checkMailFound() {
        if(mail.html === "" && mail.txt === "") {
            throw new errors.Mail("mail_not_found");
        }
    }

    function sendMail() {
        return new Promise(function(resolve, reject) {
            transporter.sendMail(mail, function(err, info) {
                if(err) { reject(new errors.Mail(err)); }
                else { resolve(info); }
            });
        });
    }

    function logSuccess() {
        debug("Mail " + template + " sent");
    }

    function logFailure(err) {
        if(err.message) { debug("Mail " + template + " not sent --> ", err.message); }
        else { debug("Mail " + template + " not sent --> ", err); }
    }
};