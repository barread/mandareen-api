var Logs = require('./file_log_system')
var mailer = require("nodemailer");
var Twig = require("twig");
var moment = require('moment');
var fs = require('fs');

module.exports = {
    NewProMail(pro) {
        try {
            var contents = fs.readFileSync('ressources/mails/pros/Pro_Management/new-pro.html.twig', 'utf8');
        }
        catch (err) {
            Logs.LogError("500", "GetNewProMailContent : " + err);
        }
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
        var mailContent = Twig.twig({ data: contents, async: false }).render({
            nom: pro.civ + " " + pro.lastname + " " + pro.firstname,
            email: pro.email,
            date: moment().format("DD-MM-YYYY HH:mm")
        });
        var mail = {
            from: "contact.mandareen@gmail.com",
            to: "contact.mandareen@gmail.com",
            subject: "[No-Reply] Nouvel utilisateur professionnel - Mandareen admin",
            html: mailContent
        }
        transporter.sendMail(mail, function (error, response) {
            if (error) {
                state = "err";
                Logs.LogError('500', "NewProMail : " + error);
                return ;
            }
            else {
                state = "ok"
                Logs.LogError('200', "NewProMail : Email send");
                return ;
            }
        })
    },
    NewSubMail(subName, pro){
        try {
            var contents = fs.readFileSync('ressources/mails/pros/Pro_Management/new_subpro.html.twig', 'utf8');
        }
        catch (err) {
            Logs.LogError("500", "GetNewSubMailContent : " + err);
        }
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
        var mailContent = Twig.twig({ data: contents, async: false }).render({
            nom: pro.civ + " " + pro.lastname + " " + pro.firstname,
            email: pro.email,
            sub: subName,
            date: moment().format("DD-MM-YYYY HH:mm")
        });
        var mail = {
            from: "contact.mandareen@gmail.com",
            to: "contact.mandareen@gmail.com",
            subject: "[No-Reply] Nouvel abonnement professionnel - Mandareen admin",
            html: mailContent
        }
        transporter.sendMail(mail, function (error, response) {
            if (error) {
                state = "err";
                Logs.LogError('500', "NewSubMail : " + err);
                return ;
            }
            else {
                state = "ok"
                Logs.LogError('200', "NewSubMail : Email send");
                return ;
            }
        })
    },
    ExpiratingSubMail(pro, subName, subDate) {
        try {
            var contents = fs.readFileSync('ressources/mails/pros/Pro_Management/subscription-expirating.html.twig', 'utf8');
        }
        catch (err) {
            Logs.LogError("500", "GetExpiratingSubMailContent : " + err);
        }
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
        var mailContent = Twig.twig({ data: contents, async: false }).render({
            nom: pro.civ + " " + pro.lastname + " " + pro.firstname,
            sub: subName,
            date: subDate
        });
        var mail = {
            from: "contact.mandareen@gmail.com",
            to: pro.email,
            subject: "[No-Reply] Votre abonnement arrive à expiration - Mandareen admin",
            html: mailContent
        }
        transporter.sendMail(mail, function (error, response) {
            if (error) {
                state = "err";
                Logs.LogError('500', "NewSubMail : " + error);
                return ;
            }
            else {
                state = "ok"
                Logs.LogError('200', "NewSubMail : Email send");
                return ;
            }
        })
    },
    ActivateSubMail(pro) {
        try {
            var contents = fs.readFileSync('ressources/mails/pros/Pro_Management/subscription_activated.html.twig', 'utf8');
        }
        catch (err) {
            Logs.LogError("500", "GetActivatedSubMailContent : " + err);
        }
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
        var mailContent = Twig.twig({ data: contents, async: false }).render({
            nom: pro.civ + " " + pro.lastname + " " + pro.firstname,
        });
        var mail = {
            from: "contact.mandareen@gmail.com",
            to: pro.email,
            subject: "[No-Reply] Votre abonnement est activé - Mandareen admin",
            html: mailContent
        }
        transporter.sendMail(mail, function (error, response) {
            if (error) {
                state = "err";
                Logs.LogError('500', "NewSubMail : " + error);
                return ;
            }
            else {
                state = "ok"
                Logs.LogError('200', "NewSubMail : Email send");
                return ;
            }
        })
    },
    FactureMail(pro, nbFacture) {
        try {
            var contents = fs.readFileSync('ressources/mails/pros/Pro_Management/facture-sub.html.twig', 'utf8');
        }
        catch (err) {
            Logs.LogError("500", "GetActivatedSubMailContent : " + err);
        }
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
        var mailContent = Twig.twig({ data: contents, async: false }).render({
            nom: pro.civ + " " + pro.lastname + " " + pro.firstname,
        });
        var mail = {
            from: "contact.mandareen@gmail.com",
            to: pro.email,
            subject: "[No-Reply] Votre facture Mandareen - Mandareen admin",
            html: mailContent,
            attachments: [{
                filename: 'facture.pdf',
                path: 'ressources/facture/facture_' + nbFacture + '.pdf',
                contentType: 'application/pdf'
            }]
        }
        transporter.sendMail(mail, function (error, response) {
            if (error) {
                state = "err";
                Logs.LogError('500', "NewSubMail : " + error);
                return ;
            }
            else {
                state = "ok"
                Logs.LogError('200', "NewSubMail : Email send");
                return ;
            }
        })
    }
}
