var request = require('supertest');
var express = require('express')
var app = require('../app.js');
var chai = require('chai');
var chaiHttp = require('chai-http');
var models = require("../models/index");

var expect = chai.expect;
var id_pro, id_patient, id_reports, id_objective, id_seance, id_recipe, id_offset;
chai.use(chaiHttp);
chai.should();


describe('PATIENT', function () {
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
         it('FindById', function (done) {
             chai.request(app)
                 .get('/patients/account/patients/' + id_patient)
                 .end(function (err, res) {
                     res.body.should.be.a('object');
                     res.body.should.have.property('id').eql(id_patient);
                     res.should.have.status(200);
                     done();
                 });
         });
         it('GetAllPatientDiaries', function (done) {
             chai.request(app)
                 .get('/patient/diaries/' + id_patient)
                 .end(function (err, res) {
                     res.body.should.be.a('array');
                     res.body.length.should.be.above(0);
                     res.should.have.status(200);
                     done();
                 });
         });
         it('GetAllRecipesName', function (done) {
             chai.request(app)
                 .get('/patient/getAllRecipesNames/')
                 .end(function (err, res) {
                     res.body.should.be.a('array');
                     res.body.length.should.be.above(0);
                     res.should.have.status(200);
                     done();
                 });
         });
         it('GetAllRecipeOffset', function (done) {
             chai.request(app)
                 .get('/patient/recipes/' + id_offset)
                 .end(function (err, res) {
                     res.body.should.be.a('array');
                     res.body.length.should.be.eql(id_offset);
                     res.should.have.status(200);
                     done();
                 });
         });
         it('GetRecipeDetails', function (done) {
             chai.request(app)
                 .get('/patient/recipeDetails/' + id_recipe)
                 .end(function (err, res) {
                     res.body.should.be.a('object');
                     res.body.should.have.property('id').eql(id_recipe);
                     res.should.have.status(200);
                     done();
                 });
         });
         it('GetMoods', function (done) {
             chai.request(app)
                 .get('/patient/moods')
                 .end(function (err, res) {
                     res.body.should.be.a('array');
                     res.body.length.should.be.above(0);
                     res.should.have.status(200);
                     done();
                 });
         });
         it('GetObjectivesByPatient', function (done) {
             chai.request(app)
                 .get('/patient/objectives/' + id_patient)
                 .end(function (err, res) {
                     res.body.should.be.a('object');
                     res.body.should.have.property('id').eql(id_patient);
                     res.should.have.status(200);
                     done();
                 });
         });
         it('GetCurrentObjective', function (done) {
             chai.request(app)
                 .get('/patient/objective/id/' + id_patient)
                 .end(function (err, res) {
                     res.body.should.be.a('object');
                     res.body.should.have.property('patient_id').eql(id_patient);
                     res.should.have.status(200);
                     done();
                 });
         });
         it('GetSeanceInProgress', function (done) {
             chai.request(app)
                 .get('/patient/getSeanceInProgress/' + id_patient)
                 .end(function (err, res) {
                     res.body.should.be.a('object');
                     res.body.should.have.property('patient_id').eql(id_patient);
                     res.should.have.status(200);
                     done();
                 });
         });
         it('GetSeanceData', function (done) {
             chai.request(app)
                 .get('/patient/seance/get/' + id_seance)
                 .end(function (err, res) {
                     res.body.should.be.a('object');
                     res.body.seance.should.have.property('id').eql(id_seance);
                     res.should.have.status(200);
                     done();
                 });
         });
    });
    describe('Route POST', function () {
        it('Login', function (done) {
            let patient = {
                email: 'test.patient@gmail.com',
                password: 'jmpechon',
            };
            chai.request(app)
                .post('/patient/login/')
                .send(patient)
                .end(function (err, res) {
                    res.should.have.status(200);
                    done();
                });
        });
        it('CreateDiary', function (done) {
            let diary = {
                id: 'test_patient1',
                content: 'Ceci est une entrée de test unitaire',
                mood_id: ''
            };
            chai.request(app)
                .post('/patient/diary/')
                .send(diary)
                .end(function (err, res) {
                    res.should.have.status(200);
                    done();
                });
        });
        it('TimePassedOnPage', function (done) {
            let time = {
                date: '2019-04-05',
                time: 23,
                patient_id: 'test_patient1',
                page: 'Diary'
            };
            chai.request(app)
                .post('/patient/timePassedOnPage')
                .send(time)
                .end(function (err, res) {
                    res.should.have.status(200);
                    done();
                });
        });
        it('ChangeEmail', function (done) {
            let email = {
                newEmail: 'test.patient255@gmail.com',
                id: 'test_patient1'
            };
            chai.request(app)
                .post('/patient/changeEmail/')
                .send(email)
                .end(function (err, res) {
                    res.should.have.status(200);
                    done();
                });
        });
        it('AddRecipeToFavorite', function (done) {
            let recipe = {
                patient_id: 'test_patient1',
                recipe_id: '5273bfa7-d531-11e9-aa48-309c2316520b'
            };
            chai.request(app)
                .post('/patient/addRecipeToFavorite/')
                .send(recipe)
                .end(function (err, res) {
                    res.should.have.status(200);
                    done();
                });
        });
        it('RemoveRecipeFromFavorite', function (done) {
            let recipe = {
                patient_id: 'test_patient1',
                recipe_id: '5273bfa7-d531-11e9-aa48-309c2316520b'
            };
            chai.request(app)
                .post('/patient/removeRecipeFromFavorite/')
                .send(recipe)
                .end(function (err, res) {
                    res.should.have.status(200);
                    done();
                });
        });
        it('IsRecipeFavorite', function (done) {
            let recipe = {
                patient_id: 'test_patient1',
                recipe_id: '5273bfa7-d531-11e9-aa48-309c2316520b'
            };
            chai.request(app)
                .post('/patient/isRecipeFavorite/')
                .send(recipe)
                .end(function (err, res) {
                    res.should.have.status(200);
                    done();
                });
        });
        it('SendNotificationData', function (done) {
            let notif = {
                patient_id: 'test_patient1',
                content: "Va faire des test",
                value: 25,
                type: 'nb_sleep'
            };
            chai.request(app)
                .post('/patient/sendNotificationData/')
                .send(notif)
                .end(function (err, res) {
                    res.should.have.status(200);
                    done();
                });
        });
        /*it('BugSend', function (done) {
            let bug = {
                id: 'test_patient1',
                explain: 'Ce bug est faux',
                cheminement: "Yen a pas, il est faux j'ai dit",
                anonymous: true
            };
            chai.request(app)
                .post('/patient/bug/send')
                .send(bug)
                .end(function (err, res) {
                    res.should.have.status(200);
                    done();
                });
        });*/
        it('SendSeanceData1', function (done) {
            let seance = {
                patient_id: 'test_patient1',
                seanceData: {
                    id: '1',
                    TextSituation: 'Je suis en test'
                }
            };
            chai.request(app)
                .post('/patient/seance/send/1')
                .send(seance)
                .end(function (err, res) {
                    res.should.have.status(200);
                    done();
                });
        });
        it('SendSeanceData2', function (done) {
            let seance = {
                patient_id: 'test_patient1',
                seanceData: {
                    id: '1',
                    TextAutomaticThinking: 'Je suis en test',
                    AutomaticThinkingDegree: 66
                }
            };
            chai.request(app)
                .post('/patient/seance/send/2')
                .send(seance)
                .end(function (err, res) {
                    res.should.have.status(200);
                    done();
                });
        });
        it('SendSeanceData3', function (done) {
            let seance = {
                patient_id: 'test_patient1',
                seanceData: {
                    id: '1',
                    TextMood: 'Je suis en test',
                    MoodGlobalDegree: 66
                }
            };
            chai.request(app)
                .post('/patient/seance/send/3')
                .send(seance)
                .end(function (err, res) {
                    res.should.have.status(200);
                    done();
                });
        });
        it('SendSeanceData4', function (done) {
            let seance = {
                patient_id: 'test_patient1',
                seanceData: {
                    id: '1',
                    TextRationalAnswer: 'Je suis en test',
                    RationalAnswerDegree: 66
                }
            };
            chai.request(app)
                .post('/patient/seance/send/4')
                .send(seance)
                .end(function (err, res) {
                    res.should.have.status(200);
                    done();
                });
        });
        it('SendSeanceData5', function (done) {
            let seance = {
                patient_id: 'test_patient1',
                seanceData: {
                    id: '1',
                    TextResult: 'Je suis en test',
                    ResultGlobalDegree: 66
                }
            };
            chai.request(app)
                .post('/patient/seance/send/5')
                .send(seance)
                .end(function (err, res) {
                    res.should.have.status(200);
                    done();
                });
        });
        it('ChangePassword', function (done) {
            let password = {
                id: 'test_patient1',
                oldPassword: 'jmpechon',
                newPassword: 'jmpechon2'
            };
            chai.request(app)
                .post('/patient/changePassword/')
                .send(password)
                .end(function (err, res) {
                    res.should.have.status(200);
                    done();
                });
        });
        /*it('SendEmailPassword', function (done) {
            let email = {
                email: 'test.patient1@gmail.com'
            };
            chai.request(app)
                .post('/patient/sendEmailPassword/')
                .send(email)
                .end(function (err, res) {
                    res.should.have.status(200);
                    done();
                });
        });*/
        it('FavoriteRecipe', function (done) {
            let recipe = {
                patient_id: 'test_patient1',
                recipe_id: '5273bfa7-d531-11e9-aa48-309c2316520b'
            };
            chai.request(app)
                .post('/patient/favoriteRecipes/')
                .send(recipe)
                .end(function (err, res) {
                    res.should.have.status(200);
                    done();
                });
        });
    });
    describe('Route PUT', function () {
        it('UpdateDiary', function (done) {
            let diary = {
                id: '',
                content: 'Un nouveau test, encore et toujours',
                patient_id: 'test_patient1',
                mood_id: ''
            };
            chai.request(app)
                .put('/patient/diary/')
                .send()
                .end(function (err, res) {
                    res.should.have.status(200);
                    done();
                });
        });
    });
});
