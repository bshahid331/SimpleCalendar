/**
 * Created by andrea.terzani on 07/04/2015.
 */
module.exports = function(app) {

    var passport = require('passport');
    var mongoose = require('mongoose');
    var LocalStrategy = require('passport-local').Strategy;
    var FacebookStrategy = require('passport-facebook').Strategy;


    var user = require('../models/usermodel.js');
    var User = mongoose.model('User');

    var event = require('../models/eventmodel.js');
    var Event = mongoose.model('Event');

    var session = require('express-session');
    var MongoStore = require('connect-mongo')(session);

    app.use(session({
        store: new MongoStore({
            url: 'mongodb://localhost/Calendar'
         }),
        secret: 'codetutorialsecret',
        resave:true,
        saveUninitialized:true
    }));

    app.use(passport.initialize());

    app.use(passport.session());


    passport.use(new LocalStrategy(
        function (username, password, done) {
            
            User.findOne({username: username}, function (err, user) {
              
                if (err) {
                    
                    return done(err);
                }
                if (!user) {
                    
                    return done(null, false, {alert: 'Incorrect username.'});
                }
                if (user.password != password) {
                   
                    return done(null, false, {alert: 'Incorrect password.'});
                }
                
                return done(null, user);
            });
        }

    ));


    passport.use(new FacebookStrategy({
            clientID: '658015424378361',
            clientSecret: '9190d43b83f5e475af2619fa069e320c',
            callbackURL: "http://localhost:3000/auth/facebook/callback",
            profileFields: ['id', 'emails', 'name']
        },function(accessToken, refreshToken, profile, done) {
            process.nextTick(function () {
                User.findOne({'email': profile.emails[0].value}, function (err, user) {
                    
                    if (err) return done(err);
                    if (user) {
                        done(null, user);
                    } else {
                        var user = new User();
                        user.username = profile.emails[0].value;
                        user.facebook.token = accessToken;
                        user.facebookprofileUrl = profile.profileUrl;
                        user.facebook.email = profile.emails[0].value;
                        user.facebook.fbid = profile.id;
                        user.facebook.displayName = profile.displayName;
                        user.firstname =profile.name.givenName;
                        user.lastname=profile.name.familyName;

                        user.save(function (err) {
                            if (err) return done(err);
                            done(null, user);
                        });
                    }
                });
            });
        }
    ));


    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
             done(err, user);
        });
    });

    function isAuthenticated(req,res,next){
        if(req.isAuthenticated())return next();
         res.redirect('/');
    }

    app.get('/auth/facebook', passport.authenticate('facebook', {scope:'email'}));

    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', { failureRedirect: '/login.html' }),
        function(req, res) {
            res.redirect('/#/user');
        });


    app.post('/auth/login', passport.authenticate('local'),function(req, res){
        res.json(req.user);
    });


    app.get('/auth/currentuser',isAuthenticated,function(req,res){
        res.json(req.user);
    });

    app.post('/auth/signup',function(req,res){

        var u =  new User();
        u.username = req.body.email;
        u.password = req.body.password;
        u.lastname = req.body.lastname;
        u.firstname = req.body.firstname;
        u.email = req.body.email;

        u.save(function(err){
            if (err) {
                res.json({'alert':'Registration error'});
            }else{
                res.json({'alert':'Registration success'});
            }
        });
    });

    /** EVENT CODE **/
    app.post('/events/add', function(req,res) {
        var e = new Event();
        e.title = req.body.title;
        e.startDate = req.body.startDate;
        e.img = req.body.img;
        e.createdBy = req.body.createdBy;

        e.save(function(err) {
            if(err) {
                res.json({'alert': 'Adding Event Failed'});
            } else {
                res.json({'alert': 'Adding Event Success'});
            }
        });
    });

    app.get('/events', function(req,res) {
        var username = req.user.username;
        Event.find({createdBy: username}, function(err, events) {
            if(err) {
                res.json({'alert': 'Adding Event Failed'});       
            } else {
                res.json({'events': events});
            }
        });
    });



     app.get('/auth/logout', function(req, res){
        req.logout();
        res.sendStatus(200);
     });

};