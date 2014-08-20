var sm = require("setimmediate");
var moment = require('moment');
var AccessToken = require('../');
var tokens = require('./fixtures/tokens.json');
var nock = require('nock');
var options = {
	site: 'https://fake-oauth.com',
	clientId: 'ABC123',
	clientSecret: 'verySecret'
};

describe('access-token', function () {

	it('should be a constructor', function () {
		AccessToken.should.be.a.function;
	});

	it('should allow instantiating without new ', function () {
		var at = AccessToken(options);
		at.should.be.an.instanceOf(AccessToken);
	});

	it('should have a token method', function () {
		var at = AccessToken(options);
		at.token.should.be.function;
	});

	it('should wrap token with required methods', function () {
		var at = AccessToken(options);
		var token = at.token(tokens.access);
		token.get.should.be.a.function;
		token.valid.should.be.a.function;
		token.refresh.should.be.a.function;
		token.expired.should.be.a.function;
	});

	it('should throw error when instantiating without site', function () {
		(function () {
			AccessToken({ clientId: options.clientId, clientSecret: options.clientSecret });
		}).should.throw(/^option 'site' is required/);
	});

	it('should throw error when instantiating without clientId', function () {
		(function () {
			AccessToken({ site: options.site, clientSecret: options.clientSecret });
		}).should.throw(/^option 'clientId' is required/);
	});

	it('should throw error when instantiating without clientSecret', function () {
		(function () {
			AccessToken({ site: options.site, clientId: options.clientSecret });
		}).should.throw(/^option 'clientSecret' is required/);
	});

	it('should throw error when validating with missing access token', function () {
		var at = AccessToken(options);
		var token = at.token({});
		(token.valid).should.throw(/^missing 'access_token'/);
	});

	it('should throw error when refreshing with missing refresh token', function () {
		var at = AccessToken(options);
		var token = at.token({});
		(token.refresh).should.throw(/^missing 'refresh_token'/);
	});

	it('should refresh token', function (done) {
		var at = AccessToken(options);
		var token = at.token(tokens.access);
		nock(options.site)
			.post('/oauth/token')
			.reply(200, tokens.refresh);
		token.refresh(function (err, res) {
			res.should.be.eql(tokens.refresh);
			done();
		});
	});

	it('should return true if token is valid', function (done) {
		var at = AccessToken(options);
		var token = at.token(tokens.access);
		nock(options.site)
			.get('/oauth/userinfo?' + at.accessTokenName + '=' + token.access_token)
			.reply(200, {});
		token.valid(function (err, valid) {
			valid.should.be.Boolean;
			valid.should.be.true;
			done();
		});
	});

	it('should return false if token is invalid', function (done) {
		var at = AccessToken(options);
		var token = at.token(tokens.access);
		nock(options.site)
			.get('/oauth/userinfo?' + at.accessTokenName + '=' + token.access_token)
			.reply(400);
		token.valid(function (err, valid) {
			valid.should.be.Boolean;
			valid.should.be.false;
			done();
		});
	});
	
	it('should return false if token is not expired', function () {
		var at = AccessToken(options);
		var token = at.token(tokens.access);
		token.expires_in = 1000;
		token.expired.should.be.false;
	});

	it('should return true if token is expired', function () {
		var at = AccessToken(options);
		var token = at.token(tokens.expired);
		token.expired.should.be.true;
	});

	it('should get same token if not expired', function (done) {
		var at = AccessToken(options);
		var token = at.token(tokens.access);
		token.get(function (err, res) {
			res.should.be.eql(tokens.access);
			done();
		});
	});

	it('should get new token if expired', function (done) {
		var at = AccessToken(options);
		var token = at.token(tokens.expired);
		nock(options.site)
			.post('/oauth/token')
			.reply(200, tokens.refresh);
		token.get(function (err, res) {
			res.should.be.eql(tokens.refresh);
			done();
		});
	});

	it('should get token validating remotely', function (done) {
		var at = AccessToken(options);
		var token = at.token(tokens.access);
		nock(options.site)
			.post('/oauth/token')
			.reply(200, tokens.refresh);

		nock(options.site)
			.get('/oauth/userinfo?' + at.accessTokenName + '=' + token.access_token)
			.reply(200, {});

		token.get(true, function (err, res) {
			res.should.be.eql(tokens.access);
			done();
		});
	});

	it('should get validating remotely with expired token', function (done) {
		var at = AccessToken(options);
		var token = at.token(tokens.expired);

		nock(options.site)
			.post('/oauth/token')
			.reply(200, tokens.refresh);

		nock(options.site)
			.get('/oauth/userinfo?' + at.accessTokenName + '=' + token.access_token)
			.reply(400);

		token.get(true, function (err, res) {
			res.should.be.eql(tokens.refresh);
			done();
		});
	});

});
