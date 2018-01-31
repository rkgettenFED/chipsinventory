var express = require('express');
var app = express();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var router = express.Router();
var moment = require('moment');
var User = require('../models/users');
var item = require('../models/item');
var profit = require('../models/profit');
var async = require('async');
var moment = require('moment');




/* GET users listing. */
router.get('/', function (req, res, next) {

    res.redirect('/users/login');

});

router.get('/profit', function (req, res) {
    async.series({
        item_total: function (callback) {
            item.aggregate({
                $group: {
                    _id: null,
                    sum: {
                        $sum: "$total"
                    }
                }
            }, callback)
        },


    }, function (err, results) {

        var weekly = results.item_total[0].sum;
        var newProfit = new profit({
            week:moment().weeks(),
            date: moment().isoWeekday("Friday"),
            amount: weekly
        });
if(moment.weekdays()==5)
{
    newProfit.save(function (err) {
        if (err) { return next(err) }
    });
}

            profit.find({},'week date amount').exec(function(err,foo){
                if(err){return next(err);}
                res.render('profit', { title: 'OVERVIEW', error: err, data: results,wklySales:foo})
            })
        
        ; 

    });
});


// Register
router.get('/register', function (req, res) {
    res.render('register');
});

// Login
router.get('/login', function (req, res) {
    res.render('login', { title: 'Login' });
    req.flash('success_msg', 5)
});

// Register User
router.post('/register', function (req, res) {
    var name = req.body.name;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;
    var secret = req.body.secret;
    var secretconfirm = "chipsexec";

    // Validation
    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password2', 'Passwords do not match').equals(req.body.password);
    req.checkBody('secret', 'The secret is incorrect').equals(secretconfirm);

    var errors = req.validationErrors();



    if (errors) {
        res.render('register', {
            errors: errors
        });
    } else {
        var newUser = new User({
            name: name,
            email: email,
            username: username,
            password: password
        });

        User.createUser(newUser, function (err, user) {
            if (err) throw err;
            console.log(user);
        });

        req.flash('success_msg', 'You are registered and can now login');

        res.redirect('/users/login');
    }
});

passport.use(new LocalStrategy(
    function (username, password, done) {
        User.getUserByUsername(username, function (err, user) {
            if (err) throw err;
            if (!user) {
                console.log(user);
                return done(null, false, {
                    message: 'Unknown User'
                });
            }

            User.comparePassword(password, user.password, function (err, isMatch) {
                if (err) throw err;
                if (isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false, {
                        message: 'Invalid password'
                    });
                }
            });

        });
    }));

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.getUserById(id, function (err, user) {
        done(err, user);
    });
});

router.post('/login',

    passport.authenticate('local', {
        //successRedirect: '/inventory',
        failureRedirect: '/users/login',
        failureFlash: 'Invalid username or password'
    }),
    function (req, res) {
        name = req.body.username;
        app.set('name', req.body.username);
        User.updateLogin(name, function (err, name) {
            console.log('login logged');

        });
        res.redirect('/inventory');
    });

router.get('/logout', function (req, res) {
    var name = app.get('name');
    console.log(name);
    req.logout();
    User.updateLogout(name, function (err, name) {
        console.log('log out logged');
    })
    req.flash('success_msg', 'You are logged out');

    res.redirect('/users/login');
});
module.exports = router;
