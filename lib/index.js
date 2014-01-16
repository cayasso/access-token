'use strict';

/**
 * Module dependencies.
 */

var moment = require('moment')
  , request = require('request')
  , predefine = require('predefine')
  , Emitter = require('events').EventEmitter
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

  var writable = predefine(this, predefine.WRITABLE)
    , readable = predefine(this);

  config = config || {};
  readable('site', config.site);
  readable('clientId', config.clientId);
  readable('clientSecret', config.clientSecret);
  readable('tokenPath', config.tokenPath || '/oauth/token');
  readable('userInfoPath', config.userInfoPath || '/oauth/userinfo');
  readable('accessTokenName', config.accessTokenName || 'access_token');
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
    return moment.unix(token.expires_at - 600).isBefore();
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

    qs[at.accessTokenName] = token.access_token;

    request({
      url: infoUrl,
      qs: qs,
      headers: headers,
      json: true
    }, function (err, res, json) {
      if (err) return fn(err, false);
      if (res.statusCode >= 400) return fn(null, false);
      fn(null, !json.error);
    });

    return token;
  });

  /**
   * Refresh access token.
   *
   * @param {Function} fn
   * @return {Token}
   * @api public
   */

  readable('refresh', function refresh(fn) {

    request.post({
        url: tokenUrl,
        form: {
          refresh_token: token.refresh_token,
          client_id: at.clientID,
          client_secret: at.clientSecret,
          grant_type: 'refresh_token'
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

      delete token.expires_at;

      fn(null, token.set(body), true);

    });

    return token;

  });

  /**
   * Check if token has expired, if expired fetch a new 
   * one from server else return existing.
   *
   * @param {Function} fn
   * @return {Token}
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
   * Check if token has expired, if expired fetch a new 
   * one from server else return existing.
   *
   * @param {Function} fn
   * @return {Token}
   * @api public
   */

  readable('set', function get(tk) {
    if (tk) predefine.merge(token, tk);
    if (!token.expires_at) {
      token.expires_at = moment().add('s', token.expires_in).unix();
    }
    return token;
  });

  return token.set();

});
