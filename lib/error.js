'use strict';

/**
 * Module exports.
 */

module.exports = AccessTokenError;

/**
 * Generic Cloud error.
 *
 * @constructor
 * @param {String} message The reason for the error
 * @api public
 */

function AccessTokenError(message) {
  Error.call(this);
  Error.captureStackTrace(this, this.constructor);
  this.message = message;
  this.name = this.constructor.name;
}

/**
 * Inherits from `Strategy`.
 */

AccessTokenError.prototype.__proto__ = Error.prototype;