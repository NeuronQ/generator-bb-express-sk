var express = require('express');
var router = express.Router();
var app = express();


var PublicController = require(global.__root + '/controllers/public-controller');

/* Home */
// router.get('/', PublicController.handler('index'));

// uncomment this instead if you use *shared* templates
// (meaning "templates that can be rendered either on server or in browser
//  depending on what you need")
router.get('/', exposeTemplates, PublicController.handler('index'));
// Middleware to expose the app's shared templates to the cliet-side of the app
// for pages which need them.
function exposeTemplates(req, res, next) {
    // Uses the `ExpressHandlebars` instance to get the get the **precompiled**
    // templates which will be shared with the client-side of the app.
    global.hbs.getTemplates('views/shared/', {
        cache      : app.enabled('view cache'),
        precompiled: true
    }).then(function (templates) {
        // RegExp to remove the ".handlebars" extension from the template names.
        var extRegex = new RegExp(global.hbs.extname + '$');

        // Creates an array of templates which are exposed via
        // `res.locals.templates`.
        templates = Object.keys(templates).map(function (name) {
            return {
                name     : name.replace(extRegex, ''),
                template : templates[name]
            };
        });

        // Exposes the templates during view rendering.
        if (templates.length) {
            res.locals.templates = templates;
        }

        setImmediate(next);
    })
    .catch(next);
}


/* Auth */
var passport = require('passport');
// var Account = require(global.__root + '/models/account');
/*
router.get('/admin/register', function(req, res) {
    res.render('register', { });
});

router.post('/admin/register', function(req, res) {
    Account.register(new Account({ username : req.body.username }), req.body.password, function(err, account) {
        if (err) {
            return res.render('register', { account : account });
        }

        passport.authenticate('local')(req, res, function () {
            res.redirect('/admin');
        });
    });
});
*/

// router.get('/_tools/createAdminUser', _createAdminUser);
// function _createAdminUser(req, res) {
//     if (req.query.pp !== 'tarnacop') {
//         return res.send('nope');
//     }
//     // return res.send('disabled');
//     Account.register(
//         new Account({ username : req.query.username }), req.query.password,
//         function(err, account) {
//             if (err) {
//                 return res.send('<pre>error:' + JSON.stringify(err, null, 2));
//             }
//
//             res.send('done!');
//         }
//     );
// }


router.get('/admin/login', PublicController.handler('login'));
// router.get('/admin/login', function(req, res) {
//     var pageContent = getContentForPage('admin_login');
//     pageContent.user = req.user;
//     res.render('login', pageContent);
// });

router.post('/admin/login', passport.authenticate('local', {
    successRedirect: '/admin',
    failureRedirect: '/admin/login'
}));

router.get('/admin/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

router.get('/ping', function(req, res){
    res.status(200).send("pong!");
});


module.exports = router;
