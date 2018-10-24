var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var GoogleStrategy = require("passport-google-oauth20").Strategy;
var User = require("../models/user.js");
var bcrypt = require("bcrypt");




passport.serializeUser(function (id, done) {
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
        console.log(profile.id);
        User.getUserBygoogleId(profile.id, (err, result, fields) => {
            if (err) {
                throw err
            } else {
                console.log(result);
                if (result.length < 1) { //not found
                    User.addUser({ username: profile.displayName, password: null, email: profile.emails[0].value, googleid: profile.id }, (err, resul) => {
                        if (err) throw err;
                        User.db().query("SELECT LAST_INSERT_ID() As user_id", (err, results, fields) => {
                            if (err) throw err;
                            console.log(results[0].user_id);
                            return cb(err, results[0].user_id);
                        })
                    })
                } else {
                    return cb(err, result[0].id); //id as retrived from database
                }

            }
        })


    }

));

module.exports = passport;