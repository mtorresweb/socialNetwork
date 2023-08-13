// importing dependencies
const jwt = require('jwt-simple');
const moment = require('moment');

//import secret key
const libjwt = require('../services/jwt.js');
const secretKey = libjwt.secretKey;

//auth function
exports.auth = (req, res, next) => {
  // validate if the auth header is present
  if (!req.headers.authorization) {
    return res.status(403).send({
      error: 'error',
      message: 'No token provided',
    });
  }

  //clean the token
  const token = req.headers.authorization.replace(/['"]+/g, '');

  try {
    //decode token
    const payload = jwt.decode(token, secretKey);

    //validate expiration
    if (payload.exp <= moment().unix()) {
      return res.status(401).send({
        status: 'error',
        message: 'token expired',
      });
    }

    //add user data to request
    req.user = payload;
  } catch (error) {
    return res.status(404).json({
      status: 'error',
      message: 'Invalid token',
      error: error,
    });
  }

  //go to the next action
  next();
};
