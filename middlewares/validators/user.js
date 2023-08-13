const { body, param } = require('express-validator');
const validateResults = require('../validationHandler.js');

exports.validateUserRegister = () => [
  body('name', 'The user  name is required')
    .exists()
    .isString()
    .isLength({ min: 3, max: 25 })
    .trim()
    .escape(),
  body('surname', 'The user name is required')
    .exists()
    .isString()
    .trim()
    .escape(),
  body('nickname', 'The nick name is required')
    .exists()
    .isString()
    .trim()
    .escape()
    .toLowerCase(),
  body('role', 'Provide a valid role').optional().isString(),
  body('email', 'A valid email address is required')
    .exists()
    .isEmail()
    .trim()
    .escape()
    .normalizeEmail(),
  body('password', 'A strong password is required')
    .exists()
    .isStrongPassword()
    .trim()
    .escape(),
  (req, res, next) => validateResults(req, res, next),
];

exports.validateUserLogIn = () => [
  body('email', 'A valid email address is required')
    .exists()
    .isEmail()
    .trim()
    .escape()
    .normalizeEmail(),
  body('password', 'A strong password is required')
    .exists()
    .isStrongPassword()
    .trim()
    .escape(),
  (req, res, next) => validateResults(req, res, next),
];

exports.validateId = () => [
  param('id', 'Id is required').exists().isString().trim().escape(),
  (req, res, next) => validateResults(req, res, next),
];

exports.validateGetAvatar = () => [
  param('image', 'Image name is required').exists().isString().trim().escape(),
  (req, res, next) => validateResults(req, res, next),
];

exports.validatePageNumber = () => [
  param('page', 'Page must be a number').optional().isInt(),
  (req, res, next) => validateResults(req, res, next),
];

exports.validateUserUpdate = () => [
  body('name', 'The user  name is required')
    .optional()
    .isString()
    .isLength({ min: 3, max: 25 })
    .trim()
    .escape(),
  body('surname', 'The user name is required')
    .optional()
    .isString()
    .trim()
    .escape(),
  body('nickname', 'The nick name is required')
    .optional()
    .isString()
    .trim()
    .escape()
    .toLowerCase(),
  body('email', 'A valid email address is required')
    .optional()
    .isEmail()
    .trim()
    .escape()
    .normalizeEmail(),
  body('password', 'A strong password is required')
    .optional()
    .isStrongPassword()
    .trim()
    .escape(),
  body('bio').optional().isString().trim().escape(),
  body('image').optional().isString().trim().escape(),
  (req, res, next) => validateResults(req, res, next),
];
