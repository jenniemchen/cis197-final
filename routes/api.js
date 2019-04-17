var express = require('express')
var router = express.Router();
var Question = require('../models/question.js')

router.get('/', function(req, res) {
    res.render('schedule');
})

router.get('/getQuestions', function (req, res, next) {
})

router.post('/addQuestion', function (req, res, next) {
})

router.post('/answerQuestion', function (req, res, next) {
})

module.exports = router;
