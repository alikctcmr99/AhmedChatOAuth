

//////////////////////////////////////////////////////




var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();







// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

app.post('/auth/github', function(req, res) {
    var accessTokenUrl = 'https://github.com/login/oauth/access_token';
    var params = {
        code: req.body.code,
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        redirect_uri: req.body.redirectUri
    };
    // Exchange authorization code for access token.
    request.post({
        url: accessTokenUrl,
        qs: params
    }, function(err, response, token) {
        var access_token = qs.parse(token).access_token;
        var github_client = github.client(access_token);
        // Retrieve profile information about the current user.
        github_client.me().info(function(err, profile) {
            if (err) {
                return res.status(400).send({
                    message: 'User not found'
                });
            }
            var github_id = profile['id'];
            db.users.find({
                _id: github_id
            }, function(err, docs) {
                // The user doesn't have an account already
                if (_.isEmpty(docs)) {
                    // Create the user
                    var user = {
                        _id: github_id,
                        oauth_token: access_token
                    }
                    db.users.insert(user);
                }
                // Update the OAuth2 token
                else {
                    db.users.update({
                        _id: github_id
                    }, {
                        $set: {
                            oauth_token: access_token
                        }
                    })
                }
            });
        });
        res.send({
            token: access_token
        });
    });
});



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
