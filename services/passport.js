require('dotenv').config();
const passportJwt = require('passport-jwt');
const passport = require('passport');
const db = require('../db/knex');

// get the strategy ready
const ExtractJwt = passportJwt.ExtractJwt;
const Strategy = passportJwt.Strategy;

// passport options
const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.KEY,
};

// set up the strategy
const strategy = new Strategy(opts, async (payload, done) => {
  //   console.log('payload: ', payload.sub);
  if (payload) {
    await db('users')
      .where({ id: payload.sub })
      .first()
      .then(response => {
        const userData = {
          id: response.id,
          email: response.email,
        };

        return done(null, userData);
      })
      .catch(err => {
        return done(null, err);
      });
  } else {
    return done(null, true);
  }
});

module.exports = strategy;
