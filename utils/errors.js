const { StatusCodes } = require('http-status-codes');

class ApiError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends ApiError {
  constructor(path) {
    super(`The requested path ${path} was not found!`, StatusCodes.NOT_FOUND);
  }
}

class ValidationError extends Error {
  constructor(errorsArray, statusCode) {
    super();
    this.statusCode = statusCode;
    this.errorArray = errorsArray;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = {
  ApiError,
  NotFoundError,
  ValidationError,
};
