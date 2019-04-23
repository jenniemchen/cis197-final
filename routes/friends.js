var express = require('express')
var router = express.Router();
var FriendRequest = require('../models/friendRequest.js');
var User = require('../models/user.js');
var isAuthenticated = require('../middlewares/isAuthenticated.js');

router.get('/', isAuthenticated, function (req, res) {
  FriendRequest.find({ to: req.session.user }, { 'from': 1, '_id': 0 }, function (err, result) {
    res.render('friends', {
      'from': result
    });
  }).catch(console.log)
})

// TO DO: fix being able to be friends with yourself
router.post('/request', isAuthenticated, function (req, res) {
  User.find({ email: req.session.user }, { 'friends': 1, '_id': 0, }, function (err, result) {
    if (!err) {
      //check that they are not already friends 
      if (result[0].friends.includes(req.body.to)) {
        console.log('already friends')
        res.send('ALREADY_FRIENDS')
      } else {
        User.find({ email: req.body.to }, { 'friends': 1, '_id': 0, }, function (err, result) {
          if (result.length === 0) {
            res.send('NOT_REGISTERED')
            console.log('not a registered user')
          } else {
            //check that a friend request doesn't already exist
            FriendRequest.find({ to: req.body.to, from: req.session.user }, function (err, result) {
              if (result.length > 0) {
                console.log('request exists');
              } else {
                //create FriendRequest object and add to collection
                const request = new FriendRequest({
                  to: req.body.to,
                  from: req.session.user,
                  accepted: false
                });
                request.save(function (err, result) {
                  if (err) {
                    console.log('error')
                  } else {
                    console.log('saved')
                    res.send('SUCCESS')
                  }
                });
              }
            })
          }
        })
      }
    }
  })
})

router.post('/accept', isAuthenticated, function (req, res) {
  //add each other to respective friends list 
  User.update({ email: req.body.from }, { '$addToSet': { friends: req.session.user } }, function (err, result) {
    User.update({ email: req.session.user }, { '$addToSet': { friends: req.body.from } }, function (err, result) {
      //remove from FriendRequest collection 
      FriendRequest.remove({ to: req.session.user, from: req.body.from }, function (err, result) {
        console.log('finished')
      })
    })
  })
})

module.exports = router;