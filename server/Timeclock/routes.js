const express = require('express');
const router = express.Router();
const store = require('jsonfile');
const moment = require('moment');

const FILENAME = './server/data/timesheet.json';

const now = () => +moment().format('X');

const isIn = timesheet =>
  timesheet.length !== 0 && timesheet[0].clockOut == null;

const calcTotalTime = timesheet => {
  return timesheet.reduce((acc, row) => {
    return acc + ((row.clockOut || now) - row.clockIn);
  }, 0);
};

// middleware that is specific to this router
router.use(function timeLog(req, res, next) {
  store.readFile(FILENAME, function(err, data) {
    if (err) {
      req.timesheet = [];
    } else {
      req.timesheet = data.timesheet;
    }
    next();
  });
});

router.get('/', function(req, res) {
  res.render('Timeclock/index.pug', {
    timesheet: req.timesheet,
    totalTime: calcTotalTime(req.timesheet),
    status: isIn(req.timesheet) ? 'in' : 'out',
  });
});

router.post('/clock-in', function(req, res) {
  if (isIn(req.timesheet)) {
    res.end('Already clocked in!');
    return;
  }
  const newTimeset = {
    sessionNumber: (req.timesheet[0] || { sessionNumber: 0 }).sessionNumber + 1,
    clockIn: now(),
    clockOut: null,
  };
  const data = { timesheet: [newTimeset, ...req.timesheet] };
  store.writeFile(FILENAME, data, function(err) {
    if (err) {
      res.sendStatus(500);
      res.end('Failed to write data.');
      global.console.log(err);
      return;
    }
    res.redirect('/');
  });
});

router.post('/clock-out', function(req, res) {
  if (!isIn(req.timesheet)) {
    res.end('Already clocked out!');
    return;
  }
  const clockOut = now();
  req.timesheet[0].clockOut = clockOut;
  const data = { timesheet: req.timesheet };
  store.writeFile(FILENAME, data, function(err) {
    if (err) {
      res.sendStatus(500);
      res.end('Failed to write data.');
      global.console.log(err);
      return;
    }
    res.redirect('/');
  });
});

router.post('/delete-record/:index', function(req, res) {
  const index = req.params.index;
  req.timesheet.splice(index, 1);
  const data = { timesheet: req.timesheet };
  store.writeFile(FILENAME, data, function(err) {
    if (err) {
      res.sendStatus(500);
      res.end('Failed to write data.');
      global.console.log(err);
      return;
    }
    res.redirect('/');
  });
});

module.exports = router;
