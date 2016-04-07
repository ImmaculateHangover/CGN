// server/config/passport.js

//requires User model

var FacebookStrategy = require('passport-facebook').Strategy;


// load up the user model
var User = require('../db/user');

// load the auth variables
var configAuth = require('./auth');

module.exports = function(passport) {

  // used to serialize the user for the session
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  // used to deserialize the user
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });
    

  passport.use(new FacebookStrategy({

    clientID: configAuth.facebookAuth.clientID,
    clientSecret: configAuth.facebookAuth.clientSecret,
    callbackURL: configAuth.facebookAuth.callbackURL,
  },
    function(token, refreshToken, profile, done) {

        // make the code asynchronous
        // User.findOne won't fire until we have all our data back from Google
      process.nextTick(function() {

        // try to find the user based on their google id
        User.findOne({ id: profile.id }, function(err, user) {
          if (err) {
            return done(err);
          }

          if (user) {
            // if a user is found, log them in
            return done(null, user);
          } else {
            // if the user isnt in our database, create a new user
            var newUser = new User();

            // set all of the relevant information
            newUser.id = profile.id;
            newUser.token = token;
            newUser.name = profile.username;
            newUser.email = profile.emails[0]; // pull the first email

            // save the user
            newUser.save(function(err) {
              if (err) {
                throw err;
              }
              return done(null, newUser);
            });
          }
        });
      });
    }));
};

