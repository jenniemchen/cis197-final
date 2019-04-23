var express = require('express')
var router = express.Router();
var User = require('../models/user.js')
var isAuthenticated = require('../middlewares/isAuthenticated.js');

router.get('/', isAuthenticated, function (req, res) {
  //res.render('profile');
  User.find({ email: req.session.user }, { 'friends': 1, '_id': 0, 'name':1 }, function (err, result) {
    let friends = [];
    if (result.length > 0) {
      friends = result[0].friends
    }
    res.render('profile', {
      "friends": friends,
      "name": result[0].name,
      "email": req.session.user
    });
  });
});

router.get('/friends', isAuthenticated, function (req, res) {
  
});

module.exports = router;