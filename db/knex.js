require('dotenv').config();
const environment = process.env.DATABASE_ENV || 'development';
const config = require('../knexfile')[environment];

module.exports = require('knex')(config);
