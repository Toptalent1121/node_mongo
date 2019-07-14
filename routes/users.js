const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

const User = require('../models/User');

// login page
router.get('/login', (req, res) => {
    res.render('login');
});

// register page
router.get('/register', (req, res) => {
    res.render('register');
});

router.post('/register', (req, res) => {
    const { name, email, password, password2 } = req.body;
    const errors = [];

    //check the forms 
    if(!name || !email || !password || !password2) {
        errors.push({
            msg: 'please fill in all fields'
        });
    }

    //check passowrd match
    if(password !== password2) {
        errors.push({
            msg: 'passwords do not match'
        });
    }

    //check passowrd length
    if(password.length < 6) {
        errors.push({
            msg: 'password should be at least 6 characters'
        });
    }

    if(errors.length > 0) {
        res.render('register', {
            errors,
            name,
            email,
            password,
            password2
        })
    } else {
       // validation passed
        User.findOne({ email: email}).then(user => {
            if(user) {
                errors.push({msg: 'Email is already registered!'});
                res.render('register', {
                    errors,
                    name,
                    email,
                    password,
                    password2
                });
            } else {
                const newUser = new User({
                    name,
                    email,
                    password
                });
                
                // Hash password
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if(err) throw error;
                        // set password to hashed
                        newUser.password = hash;
                        req.flash('success_msg', 'You are now registered and can log in');
                        //save user
                        newUser.save().then(res.redirect('/users/login')).catch(e => console.log(e));
                    })
                })
            }
        });
    }
    
});

// Login handler
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

// Logout handleer
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
})

module.exports = router;