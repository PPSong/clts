import passport from 'passport';
import passportJWT from 'passport-jwt';
import { Strategy as LocalStrategy } from 'passport-local';
import jwt from 'jsonwebtoken';
import bCrypt from 'bcryptjs';

import { User } from './models/Model';

const jwtSecret = 'jwtSecret';
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

const getPayload = (user) => {
  const { id, email } = user.toJSON();
  const payload = {
    id,
    email,
  };
  const r = {
    ...payload,
    token: jwt.sign(payload, jwtSecret),
  };

  return r;
};

passport.use(
  'local-signup',
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email, password, done) => {
      try {
        let user = await User.findOne({ where: { email } });
        if (user) {
          return done(null, false, { message: 'That email is already taken' });
        }

        user = await User.create({
          email,
          password: bCrypt.hashSync(password, 8),
        });

        if (user) {
          return done(null, getPayload(user));
        }
        return done(null, false, { message: 'Failed, Should not happen!' });
      } catch (err) {
        return done(err);
      }
    },
  ),
);

passport.use(
  'local-signin',
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
          return done(null, false, { message: 'Incorrect email.' });
        }
        if (bCrypt.compareSync(password, user.password) === true) {
          return done(null, getPayload(user));
        }
        return done(null, false, { message: 'Incorrect password.' });
      } catch (err) {
        return done(err);
      }
    },
  ),
);

passport.use(new JWTStrategy(
  {
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: jwtSecret,
  },
  async (jwtPayload, done) => {
    try {
      const user = await User.findOne({ where: { id: jwtPayload.id } });
      if (user) {
        // todo: add access range
        // const PPs = await user.getPPs();
        // user.PPs = PPs.map(item => item.id);
        return done(null, user);
      }
      return done(null, false, { message: '此用户已不存在!' });
    } catch (err) {
      return done(err);
    }
  },
));
