'use strict';
const express = require('express');
const router = express.Router();
const authRouter = require('./auth');
const filesRouter = require('./files');

router.use('/auth', authRouter); // mount auth paths
router.use('/files', filesRouter);

module.exports = router;
