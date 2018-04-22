require('dotenv').config();
const knex = require('../../db/knex');
const passport = require('passport');
const auth = require('../helpers/authHelpers');

// middlewares
exports.doesUserExist = (req, res, next) => {
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

exports.isAuth = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      res.status(500).json({ err });
    }
    if (info) {
      return res.status(401).json({
        error: info.name,
        message: info.message,
      });
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

// controllers

// register
exports.register = async (req, res) => {
  const { email, password } = req.body;
  if (email && password) {
    const hash = await auth.hashPassword(password);
    // right lets insert the user..
    await knex('users')
      .insert({
        password: hash,
        email,
      })
      .returning('id')
      .then(id => {
        // lets give them a token
        // console.log('user: ', id);
        const token = auth.genTokenRegister(id);
        return res.status(200).json({
          token: token,
        });
      })
      .catch(err => {
        console.log('this error');
        return res.status(400).json({ err });
      });
  }
};

// login
exports.login = (req, res) => {
  const { email, password } = req.body;

  if (email && password) {
    knex('users')
      .where({ email: email })
      .first()
      .returning('*')
      .then(user => {
        const passwordHash = auth.comparePasswords(password, user.password);
        if (user && passwordHash) {
          const userObj = {
            id: user.id,
            email: user.email,
            // username: user.username,
            // role: 1, // admin
          };
          const token = auth.genToken(user);
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
          message: 'User Not Found!',
        });
      });
  } else {
    res.status(400).json({
      error: 'Both Email and Password Required.',
    });
  }
};
