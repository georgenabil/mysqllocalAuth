var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var methodOverride = require("method-override");



//Auth Packages
var session = require('express-session');
var passport = require('./config/passport-config.js');
var MySQLStore = require('express-mysql-session')(session);




var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride("_method"));


// Session and Store
var options = {
  host: process.env.DB_HOST,
  port: 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

var sessionStore = new MySQLStore(options);
app.use(session({
  secret: "this is a secret",
  store: sessionStore,
  resave: false, //update the session on Reload 
  saveUninitialized: false,//  create  session cookie for all request even for not logged user

}))
app.use(passport.initialize());
app.use(passport.session());





app.use(function (req, res, next) {
  res.locals.CurrentUser = req.user;

  /*res.locals.error   = req.flash("error");
  res.locals.success = req.flash("success");*/
  next();
});

//routes
app.use('/', indexRouter);
app.use('/users', usersRouter);







// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});



// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;