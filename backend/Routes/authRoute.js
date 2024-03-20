const express = require('express');
const encrypt = require('../middleware/encrypt');
const {login,register,allUsers} = require('../controller/authController');
const protect = require('../middleware/auth');
const Router = express.Router();

Router.route('/login')
.post(login)

Router.route('/signup')
.post(encrypt,register);

Router.route('')
.get(protect,allUsers);
module.exports = Router;