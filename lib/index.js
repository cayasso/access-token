'use strict';

/**
 * Module dependencies.
 */

var moment = require('moment')
  , assert = require('assert')
  , request = require('request')
  , predefine = require('predefine')
  , AccessTokenError = require('./error')
  , debug = require('debug')('access-token')
  , Emitter = require('events').EventEmitter;

/**
 * Expose `AccessToken`.
 */

module.exports = AccessToken;

/**
 * Initialize AccessToken with the given `config` options.
 *
 * @param {Object} options
 * @api public
 */

function AccessToken(options) {
  if (!(this instanceof AccessToken)) return new AccessToken(options);

  var writable = predefine(this, predefine.WRITABLE)
    , readable = predefine(this);

  options = options || {};

  assert.equal(typeof options.site, "string", "option 'site' is required");
  assert.equal(typeof options.clientId, "string", "option 'clientId' is required");
  assert.equal(typeof options.clientSecret, "string", "option 'clientSecret' is required");

  readable('site', options.site);
  readable('clientId', options.clientId);
  readable('clientSecret', options.clientSecret);
  readable('timeBeforeExp', options.timeBeforeExp || 600);
  readable('tokenPath', options.tokenPath || '/oauth/token');
  readable('userInfoPath', options.userInfoPath || '/oauth/userinfo');
  readable('accessTokenName', options.accessTokenName || 'access_token');
}

/**
 * Inherits from `EventEmitter`.
 */

AccessToken.prototype.__proto__ = Emitter.prototype;
AccessToken.readable = predefine(AccessToken.prototype, predefine.READABLE);

/**
 * Wrap a token object with additional
 * access token helper methods.
 *
 * @param {Token} token
 * @return {Token}
 * @api public
 */

AccessToken.readable('token', function token(token) {

  if (!token || token.tokenized) return token;

  var at = this
    , infoUrl = at.site + at.userInfoPath
    , tokenUrl = at.site + at.tokenPath
    , writable = predefine(token, predefine.WRITABLE)
    , readable = predefine(token, predefine.READABLE);

  readable('tokenized', true);
  
  /**
   * Check if token is expired.
   *
   * @return {Boolean}
   * @api public
   */

  readable('expired', { get: function expired() {
    return moment.unix(token.expires_at - at.timeBeforeExp).isBefore();
  }}, true);

  /**
   * Validate access token.
   *
   * @param {Function} fn
   * @return {Token}
   * @api public
   */

  readable('valid', function valid(fn) {

    var headers = {}, qs = {};

    assert.equal(typeof token.access_token, "string", "missing 'access_token' in token object");

    qs[at.accessTokenName] = token.access_token;

    request({
      url: infoUrl,
      qs: qs,
      headers: headers,
      json: true
    }, function (err, res, json) {
      if (err) return fn(err, false);
      if (res.statusCode >= 400) return fn(null, false);
      if (!json) return fn(null, false);
      fn(null, !json.error);
    });

    return token;
  });

  /**
   * Refresh access token.
   *
   * @param {Function} fn
   * @return {Token} this
   * @api public
   */

  readable('refresh', function refresh(fn) {

    assert.equal(typeof token.refresh_token, "string", "missing 'refresh_token' in token object");

    request.post({
        url: tokenUrl,
        form: {
          refresh_token: token.refresh_token,
          client_id: at.clientId,
          client_secret: at.clientSecret,
          grant_type: 'refresh_token'
        }
      }, function post(err, res, body) {
      
      if (err) {
        console.log(tokenUrl, err);
        return fn(new AccessTokenError('Error requesting token, ' + JSON.stringify(err)));
      }

      try {
        body = JSON.parse(body);
      } catch(e) {
        return fn(e.message);
      }

      if (res.statusCode >= 400) {
        return fn(new AccessTokenError('Error requesting new token, ' + JSON.stringify(body)));
      }

      delete token.expires_at;

      if (!body) {
        return fn(new AccessTokenError('Unable to retrieve a new token'));
      }

      fn(null, token.set(body), true);

    });

    return token;

  });

  /**
   * Check if token has expired, if expired fetch a new 
   * one from server else return existing.
   *
   * @param {Boolean} [remoteCheck]
   * @param {Function} fn
   * @return {Token} this
   * @api public
   */

  readable('get', function get(remoteCheck, fn) {

    if ('function' === typeof remoteCheck) {
      fn = remoteCheck;
      remoteCheck = null;
    }

    if (remoteCheck) {
      return token.valid(function validate(err, isValid) {
        if (err) return fn(err);
        if (isValid) {
          fn(null, token);
        } else {
          token.refresh(fn);
        }
      });
    }

    if (token.expired) {
      token.refresh(fn);
    } else {
      process.nextTick(function tick() {
        fn(null, token);
      });
    }

    return token;
  });

  /**
   * Set token.
   *
   * @param {Object} tk
   * @return {Token} this
   * @api public
   */

  readable('set', function set(tk) {
    if (tk) predefine.merge(token, tk);
    if (!token.expires_at) {
      token.expires_at = moment().add(token.expires_in, 's').unix();
    }
    return token;
  });

  return token.set();

});
