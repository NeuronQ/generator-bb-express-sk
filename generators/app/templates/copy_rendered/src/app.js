global.__root = __dirname; // for project-abs path require

var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
const jsend = require('jsend');

var winston = require('winston');
var expressWinston = require('express-winston');
winston.transports.DailyRotateFile = require('winston-daily-rotate-file');

// debug messages logging
var debug = require('debug')('<%- appSlug %>:app');

// load settings file (gitignored)
const SETTINGS = global.__settings = require('./settings');


// the all mighty app...
var app = express();

// static files serving in dev mode
// (keep this as to the top of file as possible since shit can interfere with it)
app.use(express.static(path.join(__dirname, 'public')));
// var favicon = require('serve-favicon');
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

// logging
app.use(expressWinston.logger({
    transports: [
        new winston.transports.Console({
            timestamp: true,
            colorize: true,
            // msg: "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}",
        }),
        /* prefer to let the system, not the app to take care of this */
        // new (winston.transports.DailyRotateFile)({
        //     name: 'express-access-file',
        //     filename: global.__root + '/../logs/express-access.log',
        //     level: 'verbose',
        //     json: false,
        //     colorize: false,
        // })
    ],
    meta: false,
    expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
}));
global.logger = new winston.Logger({
    transports: [
        new winston.transports.Console({
            timestamp: true,
            colorize: true,
        }),
        new (winston.transports.DailyRotateFile)({
            timestamp: true,
            name: 'debug-file',
            filename: global.__root + '/../logs/debug.log',
            level: 'silly',
            json: false,
            colorize: false,
        }),
        new (winston.transports.DailyRotateFile)({
            timestamp: true,
            name: 'errors-file',
            filename: global.__root + '/../logs/errors.log',
            level: 'error',
            json: false,
            colorize: false,
        }),
    ]
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
var exphbs = require('express-handlebars');
global.hbs = exphbs.create({
    extname: '.hbs',
    layout: false,
    helpers: require(global.__root + '/common/hbs-helpers.js'),
    partialsDir: [
        'views/shared/',
        'views/partials/'
    ]
});
app.engine('hbs', global.hbs.engine);

// DB and ORM (Mongo & Mongoose)
// var mongoose = require('mongoose');
// mongoose.Promise = global.Promise;
// mongoose.connect(SETTINGS.mongoConnection);

// basics like request body json parsing and cookies handling
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(methodOverride('_method'));
app.use(jsend.middleware);

// session support
var session = require('express-session');
// NOTE: use a Mongo or a=other DB-store, this default one is full
// of bugs and werid behaviors, even for dev mode
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}));
// uncomment this to use mongo session instead
// var MongoStore = require('connect-mongo')(session);
// app.use(session({
//     store: new MongoStore({
//         mongooseConnection: mongoose.connection
//     }),
//     resave: false, // don't save session if unmodified
//     saveUninitialized: false, // don't create session until something stored
//     secret: '$wOaMog#gSwNa4B2aABAG%lIBOApvoS=Y'
// }));

// // auth - passport middleware
// var passport = require('passport');
// app.use(passport.initialize());
// app.use(passport.session());
// global.ensureAuthenticated = function(req, res, next) {
//     if (req.isAuthenticated()) return next();
//     else return res.status(401).jsend.error('unauthorized');
// };
// // auth - passport config
// var Account = require('./models/account');
// /*
// var LocalStrategy = require('passport-local').Strategy;
// passport.use(new LocalStrategy(Account.authenticate()));
// */
// passport.use(Account.createStrategy());
// passport.serializeUser(Account.serializeUser());
// passport.deserializeUser(Account.deserializeUser());

// // DEFAULT routing code (for reference/example)
// var index = require('./routes/index');
// var users = require('./routes/users');
// app.use('/', index);
// app.use('/users', users);

// routing
require('./routes')(app);
// require('./admin')(app);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handling and logging
app.use(
    function (err, req, res, next) {
        if (app.get('env') === 'development') {
            // development error handler
            // will print stacktrace
            res.status(err.status || 500);
            res.render('error', {
                message: err.message,
                error: err
            });
        } else {
            // production error handler
            // no stacktraces leaked to user
            res.status(err.status || 500);
            res.render('error', {
                message: err.status == 404 ?
                    "Not found :(" :
                    "Things are kind of broken for now. Please try again later.",
                error: {}
            });
        }

        // only log 500+ and unknown errors
        if (!err.status || err.status >= 500) {
            next(err);
        }
    },
    expressWinston.errorLogger({
        transports: [
            new winston.transports.Console({
                timestamp: true,
                colorize: true,
            }),
            new (winston.transports.DailyRotateFile)({
                timestamp: true,
                name: 'express-errors-file',
                filename: global.__root + '/../logs/express-errors.log',
                json: true,
                colorize: false,
            })
        ],
    })
);


module.exports = app;
