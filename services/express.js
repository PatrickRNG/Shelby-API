'use strict';

const config = require('../config');
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const path = require('path');
const compression = require('compression');

const errorHandler = require('../middlewares/error-handler');
const apiRouter = require('../routes/api');
const passport = require('passport');
const passportJwt = require('../services/passport');

const app = express();

const corsOptions = {
  exposedHeaders: 'Authorization',
};

app.use(compression()); //Compress all routes
app.use(bodyParser.json());
app.use(cors(corsOptions));
app.use(helmet());

if (config.env !== 'test') app.use(morgan('combined'));

// passport
app.use(passport.initialize());
passport.use('jwt', passportJwt.jwt);

const uploadsPath = path.join(__dirname, '..', 'uploads');
app.use('/uploads', express.static(uploadsPath));

app.use('/api', apiRouter);
app.use(errorHandler.handleNotFound);
app.use(errorHandler.handleError);

app.options('*', cors());

exports.start = () => {
  app.listen(config.port, err => {
    if (err) {
      console.log(`Error : ${err}`);
      process.exit(-1);
    }

    console.log(`${config.app} is running on ${config.port}`);
  });
};

exports.app = app;
