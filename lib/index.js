'use strict';

/**
 * Module dependencies.
 */

var moment = require('moment')
  , request = require('request')
  , AccessTokenError = require('./error')
  , debug = require('debug')('access-token');

/**
 * Expose `AccessToken`.
 */

module.exports = AccessToken;

/**
 * Initialize AccessToken with the given `config` options.
 *
 * @param {Object} config
 * @api public
 */

function AccessToken(config) {
  if (!(this instanceof AccessToken)) return new AccessToken(config);
  config = config || {};
  this.site = config.site;
  this.clientID = config.clientID;
  this.clientSecret = config.clientSecret;
  this.tokenPath = config.tokenPath || '/oauth/token';
  this.userInfoPath = config.userInfoPath || '/oauth/userinfo';
  this.accessTokenName = config.accessTokenName || 'access_token';
}

/**
 * Refresh access token.
 *
 * @param {Token} token
 * @return {Token}
 * @api private
 */

AccessToken.prototype.wrap = function wrap(token) {
  if (!token.expires_at) {
    token.expires_at = moment().add('s', token.expires_in).unix();
  }
  return token;
};

/**
 * Refresh access token.
 *
 * @param {Token} token
 * @param {Function} fn
 * @return {AccessToken} this
 * @api public
 */

AccessToken.prototype.refresh = function refresh(token, fn) {

  var url = this.site + this.tokenPath;

  request.post({
      url: url,
      form: {
        refresh_token: token.refresh_token,
        client_id:     this.clientID,
        client_secret: this.clientSecret,
        grant_type:    'refresh_token'
      }
    }, function post(err, res, body) {
    
    if (err) {
      return fn(new AccessTokenError('Error requesting token, ' + JSON.stringify(err)));
    }

    try {
      body = JSON.parse(body);
    } catch(e) {
      return fn(e.message);
    }

    if (res.statusCode >= 400) {
      return fn(new AccessTokenError('Error requesting new token'));
    }

    fn(null, this.wrap(body));

  }.bind(this));

  return this;
};

/**
 * Check if token is expired.
 *
 * @param {Token} token
 * @return {Boolean}
 * @api public
 */

AccessToken.prototype.isExpired = function expired(token) {
  return !moment.unix(token.expires_at + 600).isBefore();
};

/**
 * Validate access token.
 *
 * @param {Token} token
 * @param {Function} fn
 * @return {AccessToken} this
 * @api public
 */

AccessToken.prototype.isValid = function isValid(token, fn) {

  var url = this.site + this.userInfoPath;
  var headers = {};
  var qs = {};

  qs[this.accessTokenName] = token.access_token;

  request({
    url: url,
    qs: qs,
    headers: headers,
    json: true
  }, function (err, res, json) {
    console.log(arguments);
    if (err) return fn(err, false);
    if (res.statusCode >= 400) return fn(null, false);
    fn(null, !json.error);
  });

  return this;
};

/**
 * Check if token has expired, if expired fetch a new 
 * one from server else return existing.
 *
 * @param {Token} token
 * @param {Function} fn
 * @return {AccessToken} this
 * @api public
 */

AccessToken.prototype.getToken = function getToken(token, fn) {
  if (this.isExpired(token)) {
    this.refresh(token, fn);
  } else {
    process.nextTick(function tick() {
      fn(null, token);
    });
  }
  return this;
};
