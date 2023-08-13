const { validationResult } = require('express-validator');

const validateResults = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  return res.status(400).send({
    success: 'false',
    message: 'The information sent is invalid',
    errors: errors.array(),
  });
};

module.exports = validateResults;
