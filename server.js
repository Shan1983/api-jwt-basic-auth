require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');

// routes
const auth = require('./api/user_auth/auth');

// config
const app = express();
const port = process.env.PORT;

// middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);

// routes setup
app.use('/api/v1/auth', auth);

// error handlers
app.use((req, res, next) => {
  const err = new Error('Not Found!');
  err.status = 404;
  next(err);
});

if (app.get('env') === 'development') {
  app.use((req, res, next) => {
    res.status(err.status || 500);
    res.json({
      message: err.message,
      error: {},
    });
  });
}

app.use((req, res, next) => {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: {},
  });
});

app.listen(port, () => {
  console.log(`🖥  server is running on ${port}`);
});
