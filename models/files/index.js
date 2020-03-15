'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const filesSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
    },
    files: {
      type: Array,
      default: []
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Files', filesSchema);
