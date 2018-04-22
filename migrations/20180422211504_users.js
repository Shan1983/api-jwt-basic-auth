exports.up = function(knex, Promise) {
  return knex.schema.createTable('users', t => {
    t.increments();
    t.string('email');
    t.string('password');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('users');
};
