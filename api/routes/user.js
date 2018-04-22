const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');

//test route
router.get('/secret', userController.isAuth, (req, res) => {
  return res.status(200).send('super secret shit!');
});

router.post('/register', userController.register);
router.post('/login', userController.login);

module.exports = router;
