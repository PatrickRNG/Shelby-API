'use strict';

const express = require('express');
const router = express.Router();
const { login, register, forgot_password, reset_password } = require('../../../controllers/auth/controller');
const validator = require('express-validation');
const { create } = require('../../../validations/user.validation');

router.post('/register', validator(create), register); // validate and register
router.post('/login', login); // login

router.post('/forgot-password', forgot_password);
router.post('/reset-password', reset_password);
module.exports = router;
