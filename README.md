# access-token

[![Build Status](https://travis-ci.org/cayasso/access-token.png?branch=master)](https://travis-ci.org/cayasso/access-token)
[![NPM version](https://badge.fury.io/js/access-token.png)](http://badge.fury.io/js/access-token)

Small OAuth2 Access token helper.

### Instalation

```bash
$ npm install access-token
```

### Usage

```javascript

var options = {
  site: 'my.oauth.com' ,
  clientID: 'my-client-id',
  clientSecret: 'my-client-secret',
  tokenPath: '/oauth/token',
  userInfoPath: '/oauth/userinfo',
  accessTokenName: 'token',
  before: config.before || 600,
};

var accessToken = new AccessToken(options);


if (accessToken.isExpired(token)) {

  accessToken.refresh(token, function (err, newToken) {
    
    if (err) throw new Error(err);

    // to validate token
    accessToken.isValid(newToken, function (err, isValid) {
      console.log('Is token valid? ', isValid);
    });
  });
}


// get a new token if expired or return the same one

accessToken.getToken(token, function (err, token) {
  
  if (err) throw new Error(err);

  console.log('This should be a valid token', token);
});
```

### API

The `token` format referenced bellow as some methods first argument is an object like this:

```javascript
var token = {
  access_token: 'access token'
  refresh_token: 'refres token'
  expired_in:  86400 // 24 hours
  expired_at: 1389602392 // specific unix time token will expire
}
```

### AccessToken(config)

Create an AccessToken instance 

```javascript
var accessToken = new AccessToken(config);

// or

var accessToken = AccessToken(config);
```

Configuration options are:

* `site`: OAuth provider site.
* `clientID`: OAuth client id.
* `clientSecret`: OAuth client secret string.
* `tokenPath`: OAuth token path (default is `/oauth/token`).
* `userInfoPath`: User information path (default is `/oauth/userinfo`).
* `accessTokenName`: The access token field name (default is `access_token`).

### AccessToken#isExpired(token)

Check to see if an access token is expired.

```javascript
var expired = accessToken.isExpired(token);
if (expired) {
  console.log('Token is expired');
}
```

### AccessToken#isValid(token, fn)

```javascript
accessToken.isValid(token, function (err, valid) {
  if (err) {
    console.log('There was an error validating');
  }

  console.log('Is token valid', valid);
});
```

Check to see if an access token is valid by requesting the oauth provider server.

### AccessToken#refresh(token, fn);

Get a new and fresh access token from the oauth provider.

```javascript
accessToken.refresh(token, function (err, newToken) {
  if (err) throw Error(err);
  console.log('New access token is', newToken);
});
```

### Run tests

``` bash
$ make test
```

### License

(The MIT License)

Copyright (c) 2014 Jonathan Brumley &lt;cayasso@gmail.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
