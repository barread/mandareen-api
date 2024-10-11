var request = require('supertest');
var express = require('express')
var app = require('../app.js');
var chai = require('chai');
var chaiHttp = require('chai-http');
var models = require("../models/index");
var jwtUtils = require('../utils/jwt.utils')

var expect = chai.expect;
var id_pro, id_patient, id_reports, id_objective, id_seance, id_recipe, id_offset;
var id_admin, date_test, date_test2, date_test3, token;
chai.use(chaiHttp);
chai.should();


describe('ADMIN', function () {
    before(function () {
        id_pro = 'test_pro';
        id_patient = 'test_patient1';
        id_reports = '1';
        id_objective = '1';
        id_seance = '1';
        id_recipe = 'd863e8d6-d094-11e9-bdd3-309c2316520b';
        id_offset = 3;
        date_test = '2019-09';
        date_test2 = '2019-09_2019-09';
        date_test3 = '09-2019';
        id_admin = 'test_super_admin';
        return models.Admin.findOne({
            where: { id: 'test_super_admin' },
        }).then(function(_admin) {
            token = jwtUtils.generateTokenForAdmin(_admin)
        });
    })
    describe('Route GET', function () {
        it('GetAdminData', function (done) {
            chai.request(app)
                .get('/admin/data/')
                .set('authorization', token)
                .end(function (err, res) {
                    res.body.should.be.a('object');
                    res.body.should.have.property('id').eql(id_admin)
                    res.should.have.status(201);
                    done();
                });
        });
        it('GetAllAdmins', function (done) {
            chai.request(app)
                .get('/admin/alladmin/')
                .set('authorization', token)
                .end(function (err, res) {
                    res.body.should.be.a('array');
                    res.body.length.should.be.above(0);
                    res.should.have.status(200);
                    done();
                });
        });
        it('GetProfileAdmins', function (done) {
            chai.request(app)
                .get('/admin/profileadmin/')
                .set('authorization', token)
                .end(function (err, res) {
                    res.body.should.be.a('array');
                    res.body.length.should.be.above(0);
                    res.should.have.status(200);
                    done();
                });
        });
        it('GetAllPro', function (done) {
            chai.request(app)
                .get('/admin/allpro/')
                .set('authorization', token)
                .end(function (err, res) {
                    res.body.should.be.a('array');
                    res.body.length.should.be.above(0);
                    res.should.have.status(200);
                    done();
                });
        });
        it('GetProfilePro', function (done) {
            chai.request(app)
                .get('/admin/profilepro/')
                .set('authorization', token)
                .end(function (err, res) {
                    res.body.should.be.a('array');
                    res.body.length.should.be.above(0);
                    res.should.have.status(200);
                    done();
                });
        });
        it('GetProStat', function (done) {
            chai.request(app)
                .get('/admin/prostat/' + date_test)
                .set('authorization', token)
                .end(function (err, res) {
                    res.body.should.be.a('object');
                    res.body.should.have.property('nb_pro');
                    res.should.have.status(200);
                    done();
                });
        });
        it('GetPatientStat', function (done) {
            chai.request(app)
                .get('/admin/patientstat/' + date_test)
                .set('authorization', token)
                .end(function (err, res) {
                    res.body.should.be.a('object');
                    res.body.should.have.property('nb_patient');
                    res.should.have.status(200);
                    done();
                });
        });
        it('GetAPIStat', function (done) {
            chai.request(app)
                .get('/admin/apistat/' + date_test)
                .set('authorization', token)
                .end(function (err, res) {
                    res.body.should.be.a('object');
                    res.body.should.have.property('total_nb_req');
                    res.should.have.status(200);
                    done();
                });
        });
        it('GetAllStat', function (done) {
            chai.request(app)
                .get('/admin/allstats/' + date_test2)
                .set('authorization', token)
                .end(function (err, res) {
                    res.body.should.be.a('object');
                    res.body.should.have.property('From');
                    res.body.should.have.property('To');
                    res.should.have.status(200);
                    done();
                });
        });
        it('GetAllSubsFilterYes', function (done) {
            chai.request(app)
                .get('/admin/allsubs/' + 'Yes')
                .set('authorization', token)
                .end(function (err, res) {
                    res.body.should.be.a('array');
                    res.body.length.should.be.above(0);
                    res.body[0].should.have.property('pending').eql('Yes')
                    res.should.have.status(200);
                    done();
                });
        });
        it('GetAllSubsFilterNo', function (done) {
            chai.request(app)
                .get('/admin/allsubs/' + 'No')
                .set('authorization', token)
                .end(function (err, res) {
                    res.body.should.be.a('array');
                    res.body.length.should.be.above(0);
                    res.body[0].should.have.property('pending').eql('No')
                    res.should.have.status(200);
                    done();
                });
        });
        it('GetAllSubs', function (done) {
            chai.request(app)
                .get('/admin/allsubs/')
                .set('authorization', token)
                .end(function (err, res) {
                    res.body.should.be.a('array');
                    res.body.length.should.be.above(0);
                    res.should.have.status(200);
                    done();
                });
        });
        it('GetLogs', function (done) {
            chai.request(app)
                .get('/admin/logs/' + date_test3)
                .set('authorization', token)
                .end(function (err, res) {
                    res.body.should.be.a('object');
                    res.body.should.have.property('name');
                    res.should.have.status(200);
                    done();
                });
        });
        it('GetListLogs', function (done) {
            chai.request(app)
                .get('/admin/logslist/')
                .set('authorization', token)
                .end(function (err, res) {
                    res.body.should.be.a('object');
                    res.body.should.have.property('list');
                    res.should.have.status(200);
                    done();
                });
        });
        /*it('EncryptAll', function (done) {
            chai.request(app)
                .get('/admin/encryptall/')
                .end(function (err, res) {
                    res.body.should.be.a('array');
                    res.body.length.should.be.above(0);
                    res.should.have.status(200);
                    done();
                });
        });*/
    });
    describe('Route POST', function () {
        it('AdminLogin', function (done) {
            let admin = {
                login: 'test_super_admin',
                password: 'jmpechon'
            };
            chai.request(app)
                .post('/admin/login/')
                .send(admin)
                .set('authorization', token)
                .end(function (err, res) {
                    res.should.have.status(200);
                    done();
                });
        });
        it('AdminAdd', function (done) {
            let admin = {
                login: 'test_super_admin2',
                password: 'jmpechon',
                firstname: 'Jean',
                lastname: 'Marc',
                email: 'test-jeanmarc-mandareen@gmail.com',
                type: 'Admin'
            };
            chai.request(app)
                .post('/admin/add/')
                .send(admin)
                .set('authorization', token)
                .end(function (err, res) {
                    res.should.have.status(201);
                    done();
                });
        });
        it('AdminUpdate', function (done) {
            let admin = {
                id: 'test_super_admin',
                login: 'test_super_admin2',
                password: 'jmpechon',
                firstname: 'Jean',
                lastname: 'Marc',
                email: 'test-jeanmarc-mandareen@gmail.com',
                type: 'Admin'
            };
            chai.request(app)
                .post('/admin/update/')
                .send(admin)
                .set('authorization', token)
                .end(function (err, res) {
                    res.should.have.status(200);
                    done();
                });
        });
        /*it('AdminResetPassword', function (done) {
            chai.request(app)
                .post('/admin/reset/')
                .send()
                .set('authorization', token)
                .end(function (err, res) {
                    res.should.have.status(200);
                    done();
                });
        });*/
        it('AdminChangePassword', function (done) {
            let admin = {
                newPwd: 'jmpechon2',
                oldPwd: 'jmpechon'
            };
            chai.request(app)
                .post('/admin/passwd/')
                .send(admin)
                .set('authorization', token)
                .end(function (err, res) {
                    res.should.have.status(200);
                    done();
                });
        });
        it('TogleSub', function (done) {
            let sub = {
                id: '6150cea1-d4e0-11e9-aa48-309c2316520b'
            };
            chai.request(app)
                .post('/admin/tooglesub/')
                .send(sub)
                .set('authorization', token)
                .end(function (err, res) {
                    res.should.have.status(200);
                    done();
                });
        });
        it('UpdateSub', function (done) {
            let sub = {
                id: '8g0e13f2-5c4e-11e9-a81f-308d99c2a963',
                name: 'SubUnitTest',
                price: 20.0,
                patients: 350
            }
            chai.request(app)
                .post('/admin/editsubform/')
                .send(sub)
                .set('authorization', token)
                .end(function (err, res) {
                    res.should.have.status(200);
                    done();
                });
        });
        it('CreateSubForm', function (done) {
            let sub ={
                name: 'SubUnitTest',
                price: 20.0,
                patients: 250
            };
            chai.request(app)
                .post('/admin/createsubform/')
                .send(sub)
                .set('authorization', token)
                .end(function (err, res) {
                    res.should.have.status(200);
                    done();
                });
        });
        it('UpdatePro', function (done) {
            let pro = {
                id: 'test_pro',
                email: 'test-pro2@gmail.com',
                password: 'testpechon',
                civility: 'Mme',
                firstname: 'Test',
                lastname: 'Pro',
                type: 'Doctor',
                city: 'Paris',
                zipcode: '75',
                phone: '0606060606'
            };
            chai.request(app)
                .post('/admin/proupdate/')
                .send(pro)
                .set('authorization', token)
                .end(function (err, res) {
                    res.should.have.status(200);
                    done();
                });
        })
    });
    describe('Route PUT', function () {
    });
    describe('Route DELETE', function () {
    });
});
