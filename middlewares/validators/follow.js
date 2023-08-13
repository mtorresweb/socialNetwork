const { param, body } = require('express-validator');
const validateResults = require('../validationHandler.js');

exports.validateId = () => [
  param('id', 'Provide an Id').optional().isString().trim().escape(),
  (req, res, next) => validateResults(req, res, next),
];

exports.validatePageNumber = () => [
  param('page', 'Page must be a number').optional().isInt(),
  (req, res, next) => validateResults(req, res, next),
];

exports.validateSaveFollow = () => [
  body('followed').exists().isString().trim().escape(),
  (req, res, next) => validateResults(req, res, next),
];
