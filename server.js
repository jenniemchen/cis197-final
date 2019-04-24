var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var cookieSession = require('cookie-session');
var mongoose = require('mongoose');
var accountRouter = require('./routes/account.js');
var scheduleRouter = require('./routes/schedule.js');
var profileRouter = require('./routes/profile.js')
var friendRouter = require('./routes/friends.js');
var app = express();
var axios = require('axios');
var User = require('./models/user.js')
var expressSession = require('express-session');
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/final_proj')

app.engine('html', require('ejs').__express);
app.set('view engine', 'html');

app.use('/', express.static(path.join(__dirname, '')))

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// TODO: configure body parser middleware to also accept json. just do
// app.use(bodyParser.json())

app.use(cookieSession({
  name: 'local-session',
  keys: ['spooky'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

app.get('/', function (req, res, next) {
  res.render('index')
});

app.get('/google', function (req, res) {
  console.log(req.query);
  const code = req.query.code;
  axios.post('https://www.googleapis.com/oauth2/v3/token', {
    client_id: '410882968128-6lih5vvt48bpsgb0omnpmo0h54v3jnhv.apps.googleusercontent.com',
    
    grant_type: 'authorization_code',
    redirect_uri: 'https://a0813af8.ngrok.io/google',
    code
  }).then(resp => {
    console.log(resp.data)
    const access_token = resp.data.access_token;
    const refresh_token = resp.data.refresh_token;
    console.log("REFRESH_TOKEN: " + refresh_token);
    axios.get(`https://www.googleapis.com/oauth2/v3/userinfo?alt=json&access_token=${access_token}`, {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    })
      .then(resp => {
        User.findOne({ email: resp.data.email }, function (err, result) {
          req.session.user = resp.data.email;
          if (!err && result != null) {
            console.log('user exists')
            // update access token
            User.update({email: resp.data.email}, {"$set": {access_token: access_token}}, function(err, result) {
              res.redirect('/schedule')
            })
            //new user not yet in db
          } else {
            console.log('user does not exist')
            const u = new User({
              name: resp.data.name,
              email: resp.data.email,
              access_token,
              refresh_token, 
              friends: []
            });
            u.save()
              .then(() => {
                res.redirect('/schedule');
              })
          }
        })
      })
  }).catch(console.log)
})


// mount routes below 
app.use('/account', accountRouter);
app.use('/schedule', scheduleRouter);
app.use('/profile', profileRouter);
app.use('/friends', friendRouter);

// launch app at localhost 
app.use(function (err, req, res, next) {
  return res.send('ERROR :  ' + err.message)
})

app.listen(process.env.PORT || 3000, function () {
  console.log('App listening on port ' + (process.env.PORT || 3000))
})
