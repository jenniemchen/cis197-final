var express = require('express')
var router = express.Router();
var isAuthenticated = require('../middlewares/isAuthenticated.js');

router.get('/', isAuthenticated, function(req, res) {
    res.render('schedule');
})

module.exports = router;
