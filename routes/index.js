var express = require('express');
var router = express.Router();
var User = require("../models/user.js");
var bcrypt = require('bcrypt');
var passport = require('passport');
var jwt = require("jsonwebtoken");
const passportJWT = passport.authenticate('jwt', { session: false });

check = (req, res, next) => {
  if (req.isAuthenticated()) {
    next()
  } else {
    res.redirect('/login')
  }
}


router.get('/', function (req, res, next) {
  console.log(req.user)
  console.log(req.isAuthenticated());
  res.render('index', { title: JSON.stringify(req.session) });

});

router.get("/register", (req, res) => { res.render('register') })

router.post("/register", (req, res) => {
  User.getUserByname(req.body.username, (err, results, fields) => {
    console.log(results);
    if (results.length > 0) {
      res.redirect("/register");
    } else {
      bcrypt.hash(req.body.password, 10, function (err, hash) {
        User.addUser({ ...req.body, password: hash }, (err, results) => {
          if (err) {
            console.log(err)
          } else {
            User.db().query("SELECT LAST_INSERT_ID() As user_id", (err, results, fields) => {
              if (err) throw err

              req.login(results[0].user_id, (err) => {
                if (err) { console.log(err) }
                else {
                  res.redirect("/");
                }
              })
            })
          }
        })
      })
    }

  })

})



router.get("/profile",//passportJWT 
  (req, res) => {
    res.render("profile");
  })


router.get("/login", (req, res) => {
  // res.cookie('cookieName', randomNumber, { maxAge: 900000, httpOnly: true });
  res.render("login");

})

//local Strategy
router.post("/login", passport.authenticate("local", { successRedirect: "/profile", failureRedirect: "/login" }))
router.get("/logout", (req, res) => {
  req.logout();
  req.session.destroy((err) => {
    // res.clearCookie('connect.sid', { path: '/' }).status(200).redirect("/").redirect("/")
    if (err) {
      console.log(err);
    } else {
      res.redirect("/");
    }
  })
})


// Login Google Auth Strategy
router.get("/auth/google", passport.authenticate('google', { scope: ['profile', 'email'] }))
router.get('/auth/google/redirect', passport.authenticate('google', { failureRedirect: '/login', successRedirect: "/profile" }))


//JWT strategy
router.post("/api/register", (req, res) => {

  User.getUserByname(req.body.username, (err, results, fields) => {

    if (results.length > 0) {//found
      res.status(202).json("the user already exits ");
    } else {
      bcrypt.hash(req.body.password, 10, function (err, hash) {
        User.addUser({ ...req.body, password: hash }, (err, results) => {
          if (err) {
            console.log(err)
          } else {
            User.db().query("SELECT LAST_INSERT_ID() As user_id", (err, results, fields) => {
              if (err) throw err
              const token = signtoken(results[0].user_id)
              res.status(200).json({ token })

            })
          }
        })
      })
    }

  })

})
router.post("/api/token", (req, res) => {
  User.getUserByname(req.body.username, (err, results, fields) => {
    if (err) throw err;
    bcrypt.compare(req.body.password, results[0].password, (err, same) => {
      if (same) {
        const token = signtoken(results[0].id)
        res.status(200).json({ token })

      } else {
        res.status(200).json("you should resgister frist");
      }

    })

  })

})



signtoken = userid => {
  return jwt.sign({
    iss: "project",
    sub: userid,
    iat: new Date().getTime(),
    exp: new Date().setDate(new Date().getDate() + 1)
  }, process.env.JWT_SECERT)
}

function isAuth(req, res, next) {
  if (req.headers.authorization) {
    passport.authenticate('jwt', { session: false }, function (err, user, info) {
      if ((!err || !info) && user) {
        req.user = user;
        return next();
      }
      res.status(401).json({ authenticated: false, message: "Login expired." });
    })(req, res, next);
  } else {
    if (req.isAuthenticated())
      return next();
    res.status(401).json({ authenticated: false });
  }
}



module.exports = router;