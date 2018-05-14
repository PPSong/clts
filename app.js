import express from 'express';
import path from 'path';
import favicon from 'serve-favicon';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import passport from 'passport';
import cors from 'cors';
import debug from 'debug';

import index from './routes/index';
import auth from './routes/auth';
import api from './routes/api';

import './passport';

const ppLog = debug('ppLog');

const app = express();
app.use(passport.initialize());

app.use(cors());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/auth', auth);
app.use('/auth/check', passport.authenticate('jwt', { session: false }), (req, res, next) => {
  const { user } = req;
  if (user) {
    res.json({ code:1 });
  } else {
    res.json({ code:-1 });
  }
});
app.use('/api', passport.authenticate('jwt', { session: false }), api);
// app.use('/api', api);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  if (err) console.error(err.message);
  res.json({
    code: -1,
    msg: err ? err.message : "unknown",
  });
});

//const port = 3001;
//app.listen(port);
//console.log(`Listening on port ${port}`);


module.exports = app; // for testing
