const { param, body } = require('express-validator');
const validateResults = require('../validationHandler.js');

exports.validateId = () => [
  param('id', 'Id is required').exists().isString().trim().escape(),
  (req, res, next) => validateResults(req, res, next),
];

exports.validatePageNumber = () => [
  param('page', 'Page must be a number').optional().isInt(),
  (req, res, next) => validateResults(req, res, next),
];

exports.validateSavePublication = () => [
  body('text').exists().isString().trim().escape(),
  (req, res, next) => validateResults(req, res, next),
];

exports.validateFileName = () => [
  param('file', 'File name is required').exists().isString().trim().escape(),
  (req, res, next) => validateResults(req, res, next),
];
