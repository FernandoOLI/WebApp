const mongoose = require('mongoose');
const config = require('../config/database');

const LogSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  created_at: {
    type: Date,
    required: true
  }
});

module.exports = mongoose.model('Log', LogSchema);

