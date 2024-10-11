var bcrypt = require("bcrypt");
var jwtUtils = require("./jwt.utils");
var models = require("../models/index");
const debug = require("debug")("app:bug-system.controller");
var Logs = require("./file_log_system");
var moment = require("moment");
var mailManager = require("./mail_sender");
const fs = require('fs');
var PizZip = require('pizzip');
var Docxtemplater = require('docxtemplater');
var path = require('path');

module.exports = {
  CountPatient: function(ProID) {
    models.Followup.findAll({
      where: { pro_id: ProID }
    }).then(function(AllFolUp) {
      if (AllFolUp) {
        return AllFolUp.count;
      } else return 0;
    });
  },
  IsValid: function(ProID) {
    return models.Subs_pro.findOne({
      attribute: ["sub_id", "date_sub_end"],
      where: { pro_id: ProID }
    }).then(function(Sub) {
      if (Sub && moment().isBefore(Sub.date_sub_end)) {
        return true;
      } else return false;
    });
  },
  CanCreatePatient: function(ProID) {
    return models.Subs_pro.findOne({
      attribute: ["sub_id", "date_sub_end"],
      where: { pro_id: ProID }
    }).then(function(Sub) {
      if (Sub && moment().isBefore(Sub.date_sub_end)) {
        return models.Subscription.findOne({
          attribute: ["max_patients"],
          where: { id: Sub.sub_id }
        }).then(function(Sub_data) {
          if (Sub_data) {
            return Promise.resolve()
              .then(module.exports.CountPatient(ProID))
              .then(patient => {
                if (patient >= Sub_data.max_patient) {
                  return false;
                } else {
                  return true;
                }
              });
          } else return false;
        });
      } else {
        return false;
      }
    });
  },
  checkSub: function()
  {
    let date = new Date();
    return models.Subs_pro.findAll(
        {
          include:[{model: models.Pro}, {model: models.Subscription}],
          exclude: ['id'],
        }
    )
        .then(function (sub){
          for(let i = 0; i < sub.length; i++) {
            let dateSub = new Date(sub[i].date_sub_end);
            var timeDifference = parseInt((dateSub - date) / (1000 * 60 * 60 * 24)); //gives day difference
            if (sub[i].pending === 'No' && timeDifference < 7 && timeDifference >= 0) {
              mailManager.ExpiratingSubMail(sub[i].pro, sub[i].subscription.name, sub[i].date_sub_end);
            }
          }
          Logs.LogSuccessIP('', '200', 'Check Sub processed');
          return "CheckSub success"
        })
        .catch( function(err)
        {
          Logs.LogErrorIP('404', 'Check Sub Error');
          return "CheckSub Error"
        })
  },
  createPdf: function(req, docName, nbFacture, pro) {
    var CloudmersiveConvertApiClient = require('cloudmersive-convert-api-client');
    var defaultClient = CloudmersiveConvertApiClient.ApiClient.instance;// Configure API key authorization: Apikey
      var Apikey = defaultClient.authentications['Apikey'];
    Apikey.apiKey = 'd362ce8e-9250-4a8a-be91-af86b5c3cdc5';
    var apiInstance = new CloudmersiveConvertApiClient.ConvertDocumentApi();
    var inputFile = Buffer.from(fs.readFileSync(path.resolve('ressources/facture', docName)).buffer); // File | Input file to perform the operation on.
    var callback = function (error, data, response) {
      if (error) {
        Logs.LogSuccessIP(req, '200', error);
        console.error(error);
      } else {
        // console.log('API called successfully. Returned data: ' + data);
        Logs.LogSuccessIP(req, '200', 'PDF');
        fs.writeFileSync(path.resolve('ressources/facture','facture_' + nbFacture + '.pdf'), data);
          mailManager.FactureMail(pro, nbFacture);

      }
    };
      apiInstance.convertDocumentAutodetectToPdf(inputFile, callback);
  },
  filldocx: function(req, sub, pro) {
      var content = fs
          .readFileSync(path.resolve('ressources/facture', 'default_facture.docx'), 'binary');

      var zip = new PizZip(content);

      var doc = new Docxtemplater();
      doc.loadZip(zip);
      var facture = {
          lastname: req.body.facturation.lastname,
          firstname: req.body.facturation.firstname,
          address: req.body.facturation.address,
          zipcode: req.body.facturation.zipcode,
          city: req.body.facturation.city,
          sub_id: sub.id
      };
      return models.pro_bill.create(facture)
          .then(factu => {
              return models.pro_bill.findAndCountAll().then(nbFacture => {
              return models.Subscription.findOne({
                  where: {id: sub.sub_id}
              }).then(subscription => {
                  var docName = 'facture_' + nbFacture.count + '.docx';

                  //set the templateVariables
                  doc.setData({
                      ProFirstName: factu.firstname,
                      ProLastName: factu.lastname,
                      ProAddress: factu.address,
                      ProZipCode: factu.zipcode,
                      ProCity: factu.city,
                      NbFacture: nbFacture.count,
                      Date: moment().format("YYYY/MM/DD"),
                      SubName: subscription.name,
                      SubPrice: subscription.price
                  });

                  try {
                      // render the document (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
                      doc.render()
                  } catch (error) {
                      var e = {
                          message: error.message,
                          name: error.name,
                          stack: error.stack,
                          properties: error.properties,
                      }
                      console.log(JSON.stringify({error: e}));
                      // The error thrown here contains additional information when logged with JSON.stringify (it contains a property object).
                      throw error;
                  }

                  var buf = doc.getZip()
                      .generate({type: 'nodebuffer'});

                  // buf is a nodejs buffer, you can either write it to a file or do anything else with it.
                  fs.writeFileSync(path.resolve('ressources/facture', docName), buf);
                  this.createPdf(req, docName, nbFacture.count, pro);
                  return docName;
              })
          })
      });

  }
};
