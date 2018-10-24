var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var GoogleStrategy = require("passport-google-oauth20").Strategy;
var User = require("../models/user.js");
var bcrypt = require("bcrypt");




passport.serializeUser(function (id, done) {
    console.log(id + "the seizalize");
    done(null, id);  //what you put into the session 
});

passport.deserializeUser(function (id, done) { //that id in the session 

    User.getUserById(id, function (err, results, fields) {
        delete results[0]["password"];
        done(err, results[0]);
    });
});


passport.use(new LocalStrategy(
    function (username, password, done) {

        User.getUserByname(username, (err, results, fields) => {
            if (err) throw err;
            bcrypt.compare(password, results[0].password, (err, same) => {
                if (same) {
                    return done(null, results[0].id);
                } else {
                    return done(null, false);
                }

            })

        })

    })

);

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/redirect"
},
    function (accessToken, refreshToken, profile, cb) {
        User.findOrCreate({ googleId: profile.id }, function (err, user) {
            return cb(err, user);
        });
    }
));

module.exports = passport;