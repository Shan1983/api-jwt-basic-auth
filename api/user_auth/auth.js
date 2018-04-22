require('dotenv').config();
const express = require('express');
const knex = require('../../db/knex');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const passport = require('passport');

// set up the router
const router = express.Router();

// middleware for checking if user exists
const doesUserExist = (req, res, next) => {
  console.log(req.body);
  // check if the req.body has stuffs
  const { email, password } = req.body;
  if (email && password) {
    // search for the user
    knex('users')
      .where({ email })
      .first()
      .then(user => {
        if (user.email === email) {
          return res.status(400).json({
            error: 'User exists',
            message: 'One email per user account.',
          });
        } else {
          next();
        }
      })
      .catch(err => {
        // oops theres an error.. pass it on..
        // or suffer the dreaded headers cant be resent error 🤦‍♀️
        // pass it on to the register controller..
        next();
      });
  } else {
    res.status(400).json({
      error: 'Invalid Credentials',
      message: 'Email or Password Incorrect',
    });
  }
};

const isAuth = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      res.status(500).json({ err });
    }
    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized.',
        message: 'Authorization required!',
      });
    }
    return next();
  })(req, res, next);
};

//test route
router.get('/secret', isAuth, (req, res) => {
  return res.status(200).send('super secret shit!');
});

// register
router.post('/register', doesUserExist, async (req, res) => {
  const { email, password } = req.body;
  if (email && password) {
    const hash = await bcrypt.hashSync(password, 8); // fix the salt
    // right lets insert the user..
    await knex('users')
      .insert({
        password: hash,
        email,
      })
      .returning('id')
      .then(id => {
        // lets give them a token
        console.log('user: ', id);
        const token = jwt.sign(
          {
            iss: 'shan',
            sub: id[0],
            exp: moment()
              .add(1, 'days')
              .unix(),
            iat: moment().unix(),
          },
          process.env.KEY,
        );
        return res.status(200).json({
          token: token,
        });
      })
      .catch(err => {
        console.log('this error');
        return res.status(400).json({ err });
      });
  }
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (email && password) {
    knex('users')
      .where({ email })
      .first()
      .then(user => {
        const passwordHash = bcrypt.compareSync(password, user.password);
        if (user && passwordHash) {
          const userObj = {
            id: user.id,
            email: user.email,
          };
          const token = jwt.sign({ id: user.id }, process.env.KEY);
          res.status(200).json({ token, user: userObj });
        } else {
          res.status(400).json({
            error: 'Invalid Email or Password',
          });
        }
      })
      .catch(err => {
        res.status(500).json({
          error: 'Error loggin in.',
          err,
        });
      });
  } else {
    res.status(400).json({
      error: 'Both Email and Password Required.',
    });
  }
});

module.exports = router;
