const express = require('express');
const passport = require('passport');
const userController = require('../controllers/userController');

const router = express.Router();

router.post('/register', userController.register);

router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));

router.get('/google', passport.authenticate('google', { scope: ['profile'] }));

router.get('/google/callback',
    passport.authenticate('google', {
        successRedirect: '/',
        failureRedirect: '/login'
    }));

router.get('/discord', passport.authenticate('discord'));

router.get('/discord/callback',
    passport.authenticate('discord', {
        successRedirect: '/',
        failureRedirect: '/login'
    }));

module.exports = router;
