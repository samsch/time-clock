const express = require('express');
const app = express();
const timeclockRoutes = require('./Timeclock/routes');

app.set('view engine', 'pug');
app.locals.moment = require('moment');
app.locals.getTimeReadable = time =>
  Math.floor(time / 3600) +
  ' hr ' +
  Math.floor(time % 3600 / 60) +
  ' min';

app.set('views', './server');

app.use('/', timeclockRoutes);

app.get('/test', function(req, res) {
  res.send('Hello World!');
});

app.listen(3000, function() {
  global.console.log('Example app listening on port 3000!');
});
