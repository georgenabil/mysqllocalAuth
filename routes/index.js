var express = require('express');
var router = express.Router();
var User = require("../models/user.js");
var bcrypt = require('bcrypt');
var passport = require('passport');
//var LocalStrategy = require('passport-local').Strategy;
//var GoogleStrategy = require("passport-google-oauth20").Strategy;

router.get('/', function (req, res, next) {
  console.log(req.user)
  console.log(req.isAuthenticated());
  res.render('index', { title: JSON.stringify(req.session) });

});

router.get("/register", (req, res) => { res.render('register') })

router.post("/register", (req, res) => {

  bcrypt.hash(req.body.password, 10, function (err, hash) {
    User.addUser({ ...req.body, password: hash }, (err, results) => {
      if (err) {
        console.log(err)
      } else {
        User.db().query("SELECT LAST_INSERT_ID() As user_id", (err, results, fields) => {
          if (err) throw err

          req.login(results[0], (err) => {
            if (err) { console.log(err) }
            else {
              res.redirect("/");
            }
          })
        })
      }
    })
  })
})

router.get("/profile", (req, res) => {
  res.render("profile");
})


router.get("/login", (req, res) => {
  // res.cookie('cookieName', randomNumber, { maxAge: 900000, httpOnly: true });
  res.render("login");

})

router.post("/login", passport.authenticate("local", { successRedirect: "/profile", failureRedirect: "/login" }))


router.get("/logout", (req, res) => {
  /*req.session.destroy(function () {
    res.clearCookie('connect.sid', { path: '/' }).status(200).redirect("/").redirect("/")
  });
*/

  req.logout();
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    } else {
      res.redirect("/");
    }
  })

})

router.get("/auth/google", passport.authenticate('google', { scope: ['profile', 'email'] }))

router.get('/auth/google/redirect',
  passport.authenticate('google', { failureRedirect: '/login', successRedirect: "/profile" }),
  function (req, res) {
    res.redirect('/');
  });



module.exports = router;