// Update with your config settings.
module.exports = {
  development: {
    client: 'pg',
    connection: 'postgress://localhost/reddit-clone-1',
  },
  test: {
    client: 'pg',
    connection: 'postgress://localhost/reddit-clone-1-test',
  },
};
