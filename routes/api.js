var express = require('express')
var router = express.Router();
var Question = require('../models/question.js')

router.get('/getQuestions', function (req, res, next) {
  questions = Question.find({}, function (err, result) {
    if (err) next(err)
    res.json({ 
      questions: result, 
      user: req.session.user 
    })
  })
})

router.post('/addQuestion', function (req, res, next) {
  var { questionText } = req.body                 
  var author = req.session.user
  var  q = new Question({ questionText, author }) 
  q.save(function (err, result) {
    if (err) next(err)
    res.json({ status: 'OK' })
  })
})

router.post('/answerQuestion', function (req, res, next) {
  var { answer, qid } = req.body
  Question.findById(qid, function (err, question) {
    question.answer = answer
    question.save(function (saveErr, result) {
      if (saveErr) next(saveErr)
      res.json({ success: 'OK' })
    })
  })
})

module.exports = router;
