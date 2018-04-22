require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
const passport = require('passport');
const strategy = require('./services/passport');

// routes
const userRoutes = require('./api/routes/user');

// controllers
const userController = require('./api/controllers/userController');

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
app.use(passport.initialize());
passport.use(strategy);

// routes setup
app.use('/api/v1/auth', userRoutes);

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

module.exports = app;
