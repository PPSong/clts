import express from 'express';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import debug from 'debug';

const ppLog = debug('ppLog');
const router = express.Router();

router.post('/signup', (req, res, next) => {
  passport.authenticate('local-signup', { session: false }, (err, user, info) => {
    if (err) {
      next(err);
    } else if (user) {
      return res.json({ code:1, data:user });
    } else {
      return res.json(info);
    }
  })(req, res);
});

router.post('/signin', (req, res, next) => {
  passport.authenticate('local-signin', { session: false }, (err, user, info) => {
    ppLog(err, user, info);
    if (err) {
      next(err);
    } else if (user) {
      return res.json({ code:1, data:user });
    } else {
      return res.json(info);
    }
  })(req, res);
});

router.post('/signout', (req, res, next) => {
  req.logout();
  res.json({ code:1 });
});

export default router;
