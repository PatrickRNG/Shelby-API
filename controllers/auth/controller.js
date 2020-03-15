'use strict';

const User = require('../../models/user/index.js');
const jwt = require('jsonwebtoken');
const config = require('../../config');
const httpStatus = require('http-status');
const crypto = require('crypto');
const async = require('async');
const bcrypt = require('bcrypt-nodejs');
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(config.sendgrid.apiKey);

const register = async (req, res, next) => {
  try {
    const user = new User(req.body);
    const savedUser = await user.save();
    res.status(httpStatus.CREATED);
    const userResponse = {...savedUser.transform(), success: true};
    res.json(userResponse);
  } catch (error) {
    return next(User.checkDuplicateEmailError(error));
  }
};

const login = async (req, res, next) => {
  try {
    const user = await User.findAndGenerateToken(req.body);
    const payload = { sub: user.id, name: user.name, email: user.email };
    const token = jwt.sign(payload, config.secret);
    return res.json({ message: 'OK', token, success: true });
  } catch (error) {
    next(error);
  }
};

/** ask for a reset token */
const forgot_password = function(req, res) {
  async.waterfall(
    [
      function(done) {
        User.findOne({
          email: req.body.email
        }).exec(function(err, user) {
          if (user) {
            done(err, user);
          } else {
            done('User not found');
          }
        });
      },
      function(user, done) {
        // create the random token
        crypto.randomBytes(20, function(err, buffer) {
          var token = buffer.toString('hex');
          done(err, user, token);
        });
      },
      function(user, token, done) {
        User.findByIdAndUpdate(
          {
            _id: user._id
          },
          {
            reset_password_token: token,
            reset_password_expires: Date.now() + 43200000
          },
          { upsert: true, new: true }
        ).exec(function(err, new_user) {
          done(err, token, new_user);
        });
      },
      function(token, user, done) {
        const url = `http://localhost:4200/auth/reset-password?token=${token}`;
        const msg = {
          to: user.email,
          from: {
            email: config.sendgrid.email,
            name: config.sendgrid.name
          },
          subject: 'Password help has arrived!',
          html: `
          <head>
            <title>Password Reset Request</title>
          </head>
          <body>
            <div>
              <p>Copy this link ${url} to reset your password </p>
              <br>
              <div>
                Cheers!
              </div>
            </div>
          </body>`
        };
        sgMail.send(msg, (error, result) => {
          if (!error) {
            return res.json({
              message: 'Kindly check your email for further instructions'
            });
          } else {
            return res.status(422).json({
              error: `There was a problem with Sendgrid, check your API key`
            });
          }
        });
      }
    ],
    function(err) {
      return res.status(422).json({ message: err });
    }
  );
};
/**
 * Reset password
 */
const reset_password = function(req, res, next) {
  User.findOneAndUpdate(
    {
      reset_password_token: req.body.token,
      reset_password_expires: {
        $gt: Date.now()
      }
    },
    {
      password: bcrypt.hashSync(req.body.confirmPassword),
      reset_password_token: undefined,
      reset_password_expires: undefined
    },
    { upsert: true, new: true }
  ).exec(function(err, new_user) {
    return res.json({ message: 'Success, Your Password has been reset' });
  });
};

module.exports = {
  register,
  login,
  forgot_password,
  reset_password
}
