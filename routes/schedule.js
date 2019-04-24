var express = require('express')
var router = express.Router();
var User = require('../models/user.js');
var axios = require('axios');
var isAuthenticated = require('../middlewares/isAuthenticated.js');

router.get('/', isAuthenticated, function (req, res) {
  res.render('schedule');
})

router.post('/options', isAuthenticated, function (req, res) {
  let startDate = req.body.startDate;
  const endDate = req.body.endDate;
  let members = [];

  //check if string or array 
  if (Array.isArray(req.body['members[]'])) {
    members = req.body['members[]'];
  } else {
    members.push(req.body['members[]']);
  }
  members.push(req.session.user)

  const currDate = new Date();
  let start = new Date(startDate);
  const end = new Date(endDate);

  let busyTimes = [];

  // start date requested is in the past
  if (start < currDate) {
    start = currDate;
  }
  if (members.length === 1) {
    console.log('NO_FRIENDS_ADDED');
  } else {
    let count = 0;
    members.forEach(email => {
      User.find({ email: email }, (err, result) => {
        if (result.length > 0) {
          const access_token = result[0].access_token;
          axios.post('https://www.googleapis.com/calendar/v3/freeBusy', {
            items: [
              {
                id: email
              }
            ],
            timeMin: start,
            timeMax: end
          }, {
              headers: {
                Authorization: `Bearer ${access_token}`
              }
            }).then(resp => {
              //console.log(resp.data.calendars[email].busy)
              // create array of each array of busy times per user
              busyTimes.push(resp.data.calendars[email].busy);
              count++;
              // fake a callback when all members are done processing
              if (count === members.length) {
                let ans = [];
                let first = busyTimes[0];
                for (let i = 1; i < busyTimes.length; i++) {
                  let allBusy = [];
                  const second = busyTimes[i];
                  if (first.length === 0) {
                    allBusy = allBusy.concat(second);
                  } else if (second.length === 0) {
                    allBusy = allBusy.concat(first);
                  } else {
                    let minStart = first[0].start;
                    let end = first[0].end;
                    if (first[0].start > second[0].start) {
                      minStart = second[0].start;
                    } if (first[0].end > second[0].end) {
                      end = second[0].end;
                    }
                    let idx1 = 0
                    let idx2 = 0;
                    while (idx1 < first.length & idx2 < second.length) {
                      // first check merge 
                      if (second[idx2].start <= end) {
                        if (second[idx2].end >= end) {
                          end = second[idx2].end;
                        }
                        idx2++;
                      } else if (first[idx1].start <= end) {
                        if (first[idx1].end >= end) {
                          end = first[idx1].end;
                        }
                        idx1++
                      } else {
                        allBusy.push({ start: minStart, end: end });
                        minStart = first[idx1].start;
                        end = first[idx1].end;
                        if (first[idx1].start > second[idx2].start) {
                          minStart = second[idx2].start;
                        } if (first[idx1].end > second[idx2].end) {
                          end = second[idx2].end;
                        }
                      }
                    }
                    //case where one list is done but there are others left
                    if (idx2 < second.length) {
                      //check for merge at idx2
                      if (second[idx2].start < end) {
                        if (second[idx2].end > end) {
                          end = second[idx2].end;
                        }
                        idx2++;
                      }
                      allBusy.push({ start: minStart, end: end })
                      for (let j = idx2; j < second.length; j++) {
                        allBusy.push(second[j]);
                      }
                    } if (idx1 < first.length) {
                      if (first[idx1].start < end) {
                        if (first[idx1].end > end) {
                          end = first[idx1].end;
                        }
                        idx1++;
                      }
                      allBusy.push({ start: minStart, end: end })
                      for (let j = idx1; j < first.length; j++) {
                        allBusy.push(first[j]);
                      }
                    }
                  }
                  first = allBusy;
                  if (i === busyTimes.length - 1) {
                    ans = allBusy;
                  }
                }
                console.log("RESULT: " + ans);
                for (let i = 0; i < ans.length; i++) {
                  console.log(ans[i])
                }
                // find the free times by pulling out the busy times (startDate, endDate)
                let freeTimes = [];
                for (let i = 0; i < ans.length; i++) {
                  let currStart = ans[i].start;
                  let currEnd = ans[i].end;
                  if (startDate < currStart) {
                    //console.log("start: " + startDate + " end: " + currStart);
                    freeTimes.push({ start: startDate, end: currStart });
                    startDate = currEnd;
                  }
                  if (i === ans.length - 1) {
                    //console.log("start: " + currEnd + " end: " + endDate);
                    freeTimes.push({ start: currEnd, end: endDate })
                  }
                }
                res.send(freeTimes);
              }
            }).catch(console.log)
        } else {
          console.log('user does not exist');
        }
      }).catch(console.log)
    })
    //parse through busy times to get list of free times
  }
})

router.post('/addFriend', isAuthenticated, function (req, res) {
  User.find({ email: req.session.user }, { 'friends': 1, '_id': 0, }, function (err, result) {
    if (!err) {
      // no friends
      if (result.length === 0) {
        res.send('INVALID');
      } else if (result[0].friends.includes(req.body.friend)) {
        res.send('VALID');
      } else {
        res.send('NOT_FRIENDS');
      }
    }
  })
})

module.exports = router;
