// importing dependencies
const jwt = require('jwt-simple');
const moment = require('moment');

//secret key
const secretKey = 'this_is_a_secret_key_123';

//create a function to generate tokens
const createToken = (user) => {
  const payload = {
    id: user._id,
    name: user.name,
    surname: user.surname,
    nickname: user.nickname,
    email: user.email,
    role: user.role,
    image: user.image,
    iat: moment().unix(), // time when the token was created
    exp: moment().add(30, 'days').unix(), // time when the token expires
  };

  // return jwt token encoded
  return jwt.encode(payload, secretKey);
};

module.exports = {
  secretKey,
  createToken,
};
