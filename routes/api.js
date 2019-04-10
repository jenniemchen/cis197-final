var express = require('express')
var router = express.Router();
var Question = require('../models/question.js')

router.get('/getQuestions', function (req, res, next) {
  questions = Question.find({}, function (err, result) {
})

router.post('/addQuestion', function (req, res, next) {
})

router.post('/answerQuestion', function (req, res, next) {
})

module.exports = router;
