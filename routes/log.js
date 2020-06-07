const express = require('express');
const router = express.Router();
const Logs = require('../models/log');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database');

// register
router.post('/register', (req, res, next) => {
  let newLog = new Log({
    name: req.body.name,
    created_at: req.body.created_at
  });

  Log.addLog(newLog, (err, log) => {
    if (err) {
      res.json({success: false, msg: 'Failed to register log'});
    } else {
      res.json({success: true, msg: 'Log registered'});
    }
  });
});

module.exports = router;