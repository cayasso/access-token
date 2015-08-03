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
  clientId: 'my-client-id',
  clientSecret: 'my-client-secret',
  tokenPath: '/oauth/token',
  userInfoPath: '/oauth/userinfo',
  accessTokenName: 'token',
  timeBeforeExp: 800
};

var accessToken = new AccessToken(options);

var token = accessToken.token(myToken);

if (token.expired) {

  token.refresh(function (err, newToken) {
    
    if (err) throw new Error(err);

    // to validate token
    accessToken.valid(newToken, function (err, valid) {
      console.log('Is token valid? ', valid);
    });
  });
}

// get a new token if expired or return the same one

token.get(function (err, validToken) {
  
  if (err) throw new Error(err);

  console.log('This should be a valid token', validToken);
});

// you can also validate the access token against oauth server

token.valid(function(err, valid){
  if (err) throw new Error(err);

  console.log('Is token valid', valid);
});

```

### API

The `myToken` format referenced abd bellow bellow as some methods first argument is an object like this:

```javascript
var myToken = {
  access_token: 'MYACCESSTOKENABC123', // your access token
  refresh_token: 'MYREFRESHTOKENABC123', // your secret refresh token
  expired_in:  86400, // 24 hours
  expired_at: 1389602392 // specific unix time token will expire
}
```

### AccessToken(config)

Create an AccessToken instance 

```javascript
var accessToken = new AccessToken(config);
```

or 

```javascript
var accessToken = AccessToken(config);
```

Configuration options are:

* `site`: OAuth provider site.
* `clientId`: OAuth client id.
* `clientSecret`: OAuth client secret string.
* `tokenPath`: OAuth token path (default is `/oauth/token`).
* `userInfoPath`: User information path (default is `/oauth/userinfo`).
* `accessTokenName`: The access token field name (default is `access_token`).

### AccessToken#token(myToken)

Wrap a token with magic.

```javascript
var accessToken = AccessToken(config);
var token = accessToken.token(myToken);
```

### token#expired

Check to see if an access token is expired.

```javascript
if (token.expired) {
  console.log('Token is expired');
}
```

### token#valid(fn)

```javascript
token.valid(function (err, valid) {
  if (err) {
    console.log('There was an error validating');
  }

  console.log('Is token valid', valid);
});
```

Check to see if an access token is valid by requesting the oauth provider server.

### token#refresh(fn);

Get a new and fresh access token from the oauth provider.

```javascript
token.refresh(function (err, newToken) {
  if (err) throw Error(err);
  console.log('New access token is', newToken);
});
```

### token#get(fn);

If the token has expired, it will fetch a new one, otherwise it will return the current access token. 

```javascript
token.get(function (err, validToken) {
  if (err) throw Error(err);
  console.log('This is a valid accesst token', validToken);
});
```

### Run tests

``` bash
$ make test
```

### License

(The MIT License)

Copyright (c) 2015 Jonathan Brumley &lt;cayasso@gmail.com&gt;

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
