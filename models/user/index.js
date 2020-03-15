'use strict';
const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const httpStatus = require('http-status');
const APIError = require('../../utils/APIError');
const Schema = mongoose.Schema;

const roles = ['user', 'admin'];

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 4,
      maxlength: 128
    },
    fullName: {
      type: String,
      maxlength: 50
    },
    companyName: {
      type: String,
      maxlength: 50
    },
    reset_password_token: {
      type: String
    },
    reset_password_expires: {
      type: Date
    },
    role: {
      type: String,
      default: 'user',
      enum: roles
    }
  },
  {
    timestamps: true
  }
);

userSchema.pre('save', async function save(next) {
  try {
    if (!this.isModified('password')) {
      return next();
    }

    this.password = bcrypt.hashSync(this.password);
    return next();
  } catch (error) {
    return next(error);
  }
});

userSchema.method({
  transform() {
    const transformed = {};
    const fields = ['id', 'fullName', 'email', 'createdAt', 'role'];

    fields.forEach(field => {
      transformed[field] = this[field];
    });

    return transformed;
  },

  passwordMatches(password) {
    return bcrypt.compareSync(password, this.password);
  }
});

userSchema.statics = {
  roles,

  checkDuplicateEmailError(err) {
    if (err.code === 11000) {
      let error = new Error('Email already taken');
      error.errors = [
        {
          field: 'email',
          location: 'body',
          messages: ['Email already taken']
        }
      ];
      error.status = httpStatus.CONFLICT;
      return error;
    }

    return err;
  },

  async findAndGenerateToken(payload) {
    const { email, password } = payload;

    const user = await this.findOne({ email }).exec();
    if (email && password && !user)
      throw new APIError(
        `No user associated with ${email}`,
        httpStatus.NOT_FOUND
      );

    const passwordOK = await user.passwordMatches(password);

    if (!passwordOK)
      throw new APIError(`Password mismatch`, httpStatus.UNAUTHORIZED);

    return user;
  },

  async findUser(email) {
    const user = await this.findOne({ email }).exec();
    if (!user)
      throw new APIError(
        `No user associated with ${email}`,
        httpStatus.NOT_FOUND
      );
    return user;
  }
};

module.exports = mongoose.model('User', userSchema);
