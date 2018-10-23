var express = require('express');
var router = express.Router();
var User = require("../models/user.js");
var bcrypt = require('bcrypt');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

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



module.exports = router;
