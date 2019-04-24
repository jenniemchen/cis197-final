var express = require('express')
var router = express.Router();
var isAuthenticated = require('../middlewares/isAuthenticated')

router.get('/logout', isAuthenticated, function (req, res) {
  req.session.user = '';
  res.redirect('/')
})
module.exports = router;
