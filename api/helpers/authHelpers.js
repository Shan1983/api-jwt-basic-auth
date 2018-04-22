require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const moment = require('moment');

// config vars
const SALT_I = 10;
const DOMAIN = 'shan';

exports.hashPassword = password => {
  return bcrypt.hashSync(password, SALT_I);
};

exports.comparePasswords = (password, passwordDB) => {
  return bcrypt.compareSync(password, passwordDB);
};

exports.genTokenRegister = id => {
  return jwt.sign(
    {
      iss: DOMAIN,
      sub: id[0],
      exp: moment()
        .add(1, 'days')
        .unix(),
      iat: moment().unix(),
    },
    process.env.KEY,
  );
};

exports.genToken = data => {
  return jwt.sign(
    {
      iss: DOMAIN,
      sub: data,
      exp: moment()
        .add(1, 'days')
        .unix(),
      iat: moment().unix(),
    },
    process.env.KEY,
  );
};

exports.decodeToken = token => {
  const payload = jwt.decode(token, process.env.KEY);
  return payload;
};
