import passport from 'passport';
import passportJWT from 'passport-jwt';
import { Strategy as LocalStrategy } from 'passport-local';
import jwt from 'jsonwebtoken';
import bCrypt from 'bcryptjs';
import debug from 'debug';

import { User, JS } from './models/Model';

const ppLog = debug('ppLog');
const jwtSecret = 'jwtSecret';
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

const getPayload = (user) => {
  const { id, username } = user.toJSON();
  const payload = {
    id,
    username,
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
      usernameField: 'username',
      passwordField: 'password',
    },
    async (username, password, done) => {
      try {
        let user = await User.findOne({ where: { username } });
        if (user) {
          return done(null, false, { message: 'That username is already taken' });
        }

        user = await User.create({
          username,
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
      usernameField: 'username',
      passwordField: 'password',
      session: false,
    },
    async (username, password, done) => {
      try {
        const user = await User.findOne({ where: { username } });
        if (!user) {
          return done(null, false, { message: 'Incorrect username .' });
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
        // 目前一个用户只属于一个品牌, 数据库结构设计的是多对多, 为以后扩展做好了准备
        let PPIds;
        switch (user.JS) {
          case JS.PPJL:
            PPIds = await user.getPPJLPPs();
            user.PPId = PPIds[0].id;
            break;
          case JS.KFJL:
            PPIds = await user.getKFJLPPs();
            user.PPId = PPIds[0].id;
            break;
          default:
            break;
        }

        return done(null, user);
      }
      return done(null, false, { message: '此用户已不存在!' });
    } catch (err) {
      return done(err);
    }
  },
));
