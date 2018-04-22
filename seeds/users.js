const auth = require('../api/helpers/authHelpers');
const pw = auth.hashPassword('test123');

exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('users')
    .del()
    .then(function() {
      // Inserts seed entries
      return knex('users').insert([
        { email: 'test2@example.com', password: pw },
      ]);
    });
};
