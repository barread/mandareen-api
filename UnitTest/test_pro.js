var request = require('supertest');
var express = require('express')
var app = require('../app.js');
var chai = require('chai');
var chaiHttp = require('chai-http');
var models = require("../models/index");

var expect = chai.expect;
var id_pro, id_patient, id_reports, id_objective, id_seance, id_recipe, id_offset;
var newProId;

chai.use(chaiHttp);
chai.should();


describe('PRO', function () {
    before(function () {
        id_pro = 'test_pro';
        id_patient = 'test_patient1';
        id_reports = '1';
        id_objective = '1';
        id_seance = '1';
        id_recipe = 'd863e8d6-d094-11e9-bdd3-309c2316520b';
        id_offset = 3;
    })
    describe('Route GET', function () {
        it('Cares', function (done) {
            chai.request(app)
                .get('/pro/cares')
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    res.body.should.be.a('array');
                    res.body.length.should.be.eql(6);
                    res.should.have.status(200);
                    done();
                });
        });
        it('Followup', function (done) {
            chai.request(app)
                .get('/pro/followups/proId/' + id_pro)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    res.body.should.be.a('array');
                    res.body.length.should.be.eql(5);
                    res.body[0].should.have.property('pro_id').eql(id_pro);
                    res.should.have.status(200);
                    done();
                });
        });
        it('GetPatientsByPro', function (done) {
            chai.request(app)
                .get('/pro/patients/proId/' + id_pro)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    res.body.should.be.a('array');
                    res.body.length.should.be.above(0);
                    res.body[0].should.have.property('pro_id').eql(id_pro);
                    res.should.have.status(200);
                    done();
                });
        });
        it('GetPatients', function (done) {
            chai.request(app)
                .get('/pro/patients/')
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    res.body.should.be.a('array');
                    res.body.length.should.be.above(0);
                    res.should.have.status(200);
                    done();
                });
        });
        it('GetPatientsById', function (done) {
            chai.request(app)
                .get('/pro/patient/id/' + id_patient)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    res.body.should.be.a('object');
                    res.body.should.have.property('id').eql(id_patient);
                    res.should.have.status(200);
                    done();
                });
        });
        it('GetStatsById', function (done) {
            chai.request(app)
                .get('/pro/patient/stats/' + id_patient)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    res.body.should.be.a('object');
                    res.body.should.have.property('id_patient').eql(id_patient);
                    res.should.have.status(200);
                    done();
                });
        });
        it('GetObjectivesByPatient', function (done) {
            chai.request(app)
                .get('/pro/patient/objectives/' + id_patient)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    //console.log(res.body);
                    res.body.should.be.a('array');
                    res.body.length.should.be.above(0);
                    res.body[0].should.have.property('patient_id').eql(id_patient);
                    res.should.have.status(200);
                    done();
                });
        });
        it('GetReportsByPro', function (done) {
            chai.request(app)
                .get('/pro/reports/proId/' + id_pro)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    res.body.should.be.a('array');
                    res.body.length.should.be.above(0);
                    res.should.have.status(200);
                    done();
                });
        });
        it('GetReportById', function (done) {
            chai.request(app)
                .get('/pro/report/id/' + id_reports)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    res.body.should.be.a('object');
                    res.body.should.have.property('id').eql(id_reports);
                    res.should.have.status(200);
                    done();
                });
        });
        it('GetReportsByPatient', function (done) {
            chai.request(app)
                .get('/pro/reports/patientId/' + id_patient)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    res.body.should.be.a('array');
                    res.body.length.should.be.above(0);
                    res.body[0].patient.should.have.property('id').eql(id_patient);
                    res.should.have.status(200);
                    done();
                });
        });
        it('Seance', function (done) {
            chai.request(app)
                .get('/pro/seance/get/' + id_pro)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    res.body.should.be.a('array');
                    res.body.length.should.be.above(0);
                    res.should.have.status(200);
                    done();
                });
        });
        it('GetCurrentSub', function (done) {
            chai.request(app)
                .get('/pro/sub/current/' + id_pro)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    res.body.should.be.a('object');
                    res.body.should.have.property('pending').eql('No');
                    res.should.have.status(200);
                    done();
                });
        });
        it('GetSubList', function (done) {
            chai.request(app)
                .get('/pro/sub/list/')
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    res.body.should.be.a('array');
                    res.body.length.should.be.above(0);
                    res.should.have.status(200);
                    done();
                });
        });
    });
       describe('Route POST', function () {
           it('Register', function (done)
           {
               let account = {
                   email: 'test-pro@gmail.com',
                   password: 'test1234',
                   civility: 'M',
                   firstname: 'JeanMichel',
                   lastname: 'Crapaud',
                   city: 'Google',
                   phone: '606060606',
                   zipcode: '75',
                   adeli: '666'
               }
               chai.request(app)
                   .post('/pro/auth/register/')
                   .send(account)
                   .end(function (err, res){
                       res.should.have.status(200);
                       done();
                   });
           });
           it('Login', function (done)
           {
              let account = {
                  email: 'test-pro@gmail.com',
                  password: 'test1234'
              };
              chai.request(app)
                  .post('/pro/auth/login/')
                  .send(account)
                  .end(function (err, res){
                     res.should.have.status(200);
                     newProId = res.body.pro.id;
                     done();
                  });
           });
           /*it('SendEmailPassword', function (done)
           {
               let account = {
                   email: 'test-pro@gmail.com'
               }
               chai.request(app)
                   .post('/pro/auth/sendEmailPassword/')
                   .send(account)
                   .end(function (err, res){
                       res.should.have.status(200);
                       done();
                   });
           });
           it('SendBug', function (done)
           {
               let bug = {
                   id: 'test_pro',
                   explain: 'Ce bug est un test',
                   cheminement: 'Lancer un unit test'
               }
               chai.request(app)
                   .post('/pro/bug/send')
                   .send(bug)
                   .end(function (err, res){
                       res.should.have.status(200);
                       done();
                   });
           });*/
           it('RequestSub', function (done)
           {
               let sub = {
                   id: newProId,
                   sub_name: 'Premium',
                   duration: 1
               };
               console.log(newProId)
               chai.request(app)
                   .post('/pro/sub/request')
                   .send(sub)
                   .end(function (err, res){
                       res.should.have.status(200);
                       done();
                   });
           });
           it('PayCurrentSub', function (done)
           {
               let sub = {
                   id: newProId
               };
               console.log(newProId)
               chai.request(app)
                   .post('/pro/sub/pay')
                   .send(sub)
                   .end(function (err, res){
                       res.should.have.status(200);
                       done();
                   });
           });
           it('NewFollowup', function (done)
           {
               let followup = {
                   pro_id: newProId,
                   care_id: '8f03bfdb-5c4e-11e9-a81f-308d99c2a963',
                   patient_id: 'test_patient1'
               }
               chai.request(app)
                   .post('/pro/followup/new')
                   .send(followup)
                   .end(function (err, res){
                       res.should.have.status(200);
                       done();
                   });
           });
           it('CreatePatient', function (done)
           {
               let patient = {
                   email: 'test-patient@gmail.com',
                   password: 'test1234',
                   civility: 'M',
                   firstname: 'JeanJacques',
                   lastname: 'Cartoon',
                   birthdate: '1997-03-06',
                   pro_id: 'test_pro',
                   care_id: '8f03bfdb-5c4e-11e9-a81f-308d99c2a963'
               }
               chai.request(app)
                   .post('/pro/patient/create')
                   .send(patient)
                   .end(function (err, res){
                       res.should.have.status(200);
                       done();
                   });
           });
           it('StartMandareenSession', function (done)
           {
               let seance = {
                   patient: {
                       id: 'test_patient1'
                   }
               }
               chai.request(app)
                   .post('/pro/patient/startMandareenSession')
                   .send(seance)
                   .end(function (err, res){
                       res.should.have.status(200);
                       done();
                   });
           });
           it('CreateObjectives', function (done)
           {
               let obj = {
                   id_patient: 'test_patient1',
                   obj_sleep: 10,
                   obj_cal: 2000,
                   obj_sport: 10,
                   due_date: '2021-05-06'
               }
               chai.request(app)
                   .post('/pro/patient/createobjective')
                   .send(obj)
                   .end(function (err, res){
                       res.should.have.status(200);
                       done();
                   });
           });
           it('NewReports', function (done)
           {
               let report = {
                   content: 'Ceci est un rapport de test',
                   pro_id: 'test_pro',
                   patient_id: 'test_patient1',
                   date: '2019-09-10'
               }
               chai.request(app)
                   .post('/pro/report/new')
                   .send(report)
                   .end(function (err, res){
                       res.should.have.status(200);
                       done();
                   });
           });
       });
       describe('Route PUT', function () {
           it('AccountUpdate', function (done)
           {
               let pro = {
                   id: newProId,
                   civility: 'M',
                   firstname: 'JeanMichel',
                   lastname: 'Crapaud',
                   city: 'Paris',
                   phone: '606060606',
                   zipcode: '75',
                   adeli: '666'
               }
               chai.request(app)
                   .put('/pro/account/update')
                   .send(pro)
                   .end(function (err, res){
                       res.should.have.status(200);
                       done();
                   });
           });
           it('UpdateEmail', function (done)
           {
               let pro = {
                   pro_id: newProId,
                   email: 'test-pro-test@gmail.com'
               }
               chai.request(app)
                   .put('/pro/account/email')
                   .send(pro)
                   .end(function (err, res){
                       res.should.have.status(200);
                       done();
                   });
           });
           it('UpdatePassword', function (done)
           {
               let pro = {
                   pro_id: newProId,
                   currentPassword: 'test1234',
                   newPassword: 'test12345'
               }
               chai.request(app)
                   .put('/pro/account/password')
                   .send(pro)
                   .end(function (err, res){
                       res.should.have.status(200);
                       done();
                   });
           });
           it('UpdatePatient', function (done)
           {
               let patient = {
                   id: 'test_patient1',
                   civility: 'M',
                   firstname: 'JeanJacques',
                   lastname: 'Martin',
                   birthdate: '1997-03-06',
                   pro_id: 'test_pro',
                   care_id: '8f03bfdb-5c4e-11e9-a81f-308d99c2a963'
               }
               chai.request(app)
                   .put('/pro/patient/update')
                   .send(patient)
                   .end(function (err, res){
                       res.should.have.status(200);
                       done(patient);
                   });
           });
           /*it('ResetPassword', function (done)
           {
               let patient = {
                   id: 'test_patient1'
               }
               chai.request(app)
                   .put('/pro/patient/resetPassword')
                   .send(patient)
                   .end(function (err, res){
                       res.should.have.status(200);
                       done();
                   });
           });*/
           it('UpdateReports', function (done)
           {
               let report = {
                   id: id_reports,
                   content: "blablabla c'est les test unitaires"
               }
               chai.request(app)
                   .put('/pro/report/id/' + id_reports)
                   .send(report)
                   .end(function (err, res){
                       res.should.have.status(200);
                       done();
                   });
           });
       });
       /*describe('Route DELETE', function () {
           it('DeleteObjective', function (done)
           {
               chai.request(app)
                   .delete('/pro/patient/deleteobjective/id/' + id_objective)
                   .end(function (err, res){
                       res.should.have.status(200);
                       done();
                   });
           });
           it('DeleteReport', function (done)
           {
               chai.request(app)
                   .delete('/pro/report/id/' + id_reports)
                   .end(function (err, res){
                       res.should.have.status(200);
                       done();
                   });
           });
           it('DeleteSeance', function (done)
           {
               chai.request(app)
                   .delete('/pro/seance/delete/' + id_seance)
                   .end(function (err, res){
                       res.should.have.status(200);
                       done();
                   });
           });
       });*/
});

