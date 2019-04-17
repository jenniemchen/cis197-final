var express = require('express')
var router = express.Router();
var isAuthenticated = require('../middlewares/isAuthenticated')
var User = require('../models/user.js')

router.get('/login', function (req, res) {
  res.render('login')
})

//error handling occurs via google auth
router.post('/login', function (req, res, next) {
  var name = req.body.name;
  var email = req.body.email;
  User.findOne({ email: email }, function (err, result) { 
    if (!err && result != null) {
      req.session.user = email;
      res.redirect('/')
    //new user not yet in db
    } else {
      var u = new User({ name: name, email: email })
      u.save(function (err, result) { 
        if (err) {
          next(err)
        }
        if (!err) {
          res.redirect('/')
        }
      })
    }
  })
})

router.get('/logout', isAuthenticated, function (req, res) {
  req.session.user = '';
  res.redirect('/')
})
module.exports = router;
