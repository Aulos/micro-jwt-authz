# micro-jwt-authz

Validate a JWTs `scope` to authorize access to an endpoint.

## Install

    $ npm install micro-jwt-authz

## Usage

Use together with [micro-jwt-auth](https://github.com/kandros/micro-jwt-auth) to both validate a JWT and make sure it has the correct permissions to call an endpoint.

```javascript
const jwtAuth = require('micro-jwt-auth');
const jwtAuthz = require('micro-jwt-authz');

const compose = (...fns) => fns.reduce((f, g) => (...args) => f(g(...args)));

const options = {};
module.exports = compose(
  jwtAuth('shared_secret'),
  jwtAuthz([ 'read:users' ], option),
  function(req, res) { ... }
);
```

If multiple scopes are provided, the user must have _any_ the required scopes.

```javascript
const handler = compose(
  jwtAuth('shared_secret'),
  jwtAuthz([ 'read:users', 'write:users' ], {}),
  function(req, res) { ... }
);

// This user will have access
var authorizedUser = {
  scope: 'read:users'
};
```

To check that the user has _all_ the scopes provided, use the `checkAllScopes: true` option:

```javascript
const handler = compose(
  jwtAuth('shared_secret'),
  jwtAuthz([ 'read:users', 'write:users' ], { checkAllScopes: true }),
  function(req, res) { ... }
);

// This user will have access
var authorizedUser = {
  scope: 'read:users write:users'
};

// This user will NOT have access
var unauthorizedUser = {
  scope: 'read:users'
};
```

The JWT must have a `scope` claim and it must either be a string of space-separated permissions or an array of strings. For example:

```
// String:
"write:users read:users"

// Array:
["write:users", "read:users"]
```

## Options

- `failWithError`: When set to `true`, will forward errors to `next` instead of ending the response directly. Defaults to `false`.
- `checkAllScopes`: When set to `true`, all the expected scopes will be checked against the user's scopes. Defaults to `false`.
- `customScopeKey`: The property name to check for the scope. By default, permissions are checked against `user.scope`, but you can change it to be `user.myCustomScopeKey` with this option. Defaults to `scope`.

## Issue Reporting

If you have found a bug or if you have a feature request, please report them at this repository issues section. Please do not report security vulnerabilities on the public GitHub issue tracker. The [Responsible Disclosure Program](https://auth0.com/whitehat) details the procedure for disclosing security issues.

## Author

[Auth0](https://auth0.com), [Aulos](https://github.com/Aulos)

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more info.
