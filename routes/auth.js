var express = require('express');
var router = express.Router();
var User  = require('./../app/models/user');
var passport = require('passport');


/* handleAuth creates a session object, which we then store the username as a user
 * property under the req.session object
 */

function handleAuth(req, res, username) {
  req.session.regenerate(function() {
    req.session.user = username;
    console.log("SESSION!!!" + req.session.user);
    res.redirect("..#/events");
  });
}

// Facebook OAuth Initiation
router.get('/facebook', passport.authenticate('facebook'), function(req, res){
});

// Facebook OAuth Callback
router.get('/facebook/callback', passport.authenticate('facebook', { failureRedirect: '#/signup' }), function(req, res) {
  res.redirect('#/signin');
});

// Google OAuth Initiation
router.get('/google', passport.authenticate('google', { scope: 'https://www.googleapis.com/auth/plus.login' }), function(req, res){
});

// Google OAuth Callback
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '#/signup' }), function(req, res) {
 res.redirect('#/signin');
});

// Local Auth Sign-in
router.post('/local', passport.authenticate('local', { failureRedirect: '#/signup' }), function(req, res) {
  var username = req.body.username;
  handleAuth(req, res, username);
});

// Local Auth Sign-up
router.post('/local-signup', function(req, res, next) {
 
  var username  = req.body.username;
  var password  = req.body.password;
 
  new User({username:username})
    .fetch()
    .then(function(model){
      if(model) {
        next(new Error('User already exists'));
      } else {
        new User({username:username,password:password},{isNew:true}).save()
	        .then(function(model){
	          handleAuth(req, res, username);
	        });
        }
    })
    .catch(function(error){
      console.log('hi',error);
    });
});

/* Logout... console logs are for checking the req.session object before and after it's
 * destroyed to ensure it's working.
 */

router.get('/logout', function(req, res, next) {

  console.log("Before destroy session... " + req.session.user);
  req.session.destroy(function() {
    console.log("Destroying express-session object for this session... " + req.session);
    res.redirect('..#/signin');
  });

});

module.exports = router;
