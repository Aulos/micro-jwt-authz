module.exports = (expectedScopes, options) => handler => {
  if (!Array.isArray(expectedScopes)) {
    throw new Error(
      'Parameter expectedScopes must be an array of strings representing the scopes for the endpoint(s)'
    );
  }

  options = options || {};

  return (req, res) => {
    const error = res => {
      const err_message = 'Insufficient scope';

      if (options.failWithError) {
        return next({
          statusCode: 403,
          error: 'Forbidden',
          message: err_message
        });
      }

      res.setHeader(
        'WWW-Authenticate',
        `Bearer scope="${expectedScopes.join(' ')}", error="${err_message}"`
      );
      res.statusCode = 403;
      res.end(err_message);
    };

    if (expectedScopes.length === 0) {
      return handler(res, req);
    }

    let userScopes = [];
    let scopeKey = 'scope';
    if (
      options.customScopeKey != null &&
      typeof options.customScopeKey === 'string'
    ) {
      scopeKey = options.customScopeKey;
    }

    if (!req.user) {
      return error(res);
    }

    if (typeof req.user[scopeKey] === 'string') {
      userScopes = req.user[scopeKey].split(' ');
    } else if (Array.isArray(req.user[scopeKey])) {
      userScopes = req.user[scopeKey];
    } else {
      return error(res);
    }

    let allowed;
    if (options.checkAllScopes) {
      allowed = expectedScopes.every(scope => userScopes.includes(scope));
    } else {
      allowed = expectedScopes.some(scope => userScopes.includes(scope));
    }

    return allowed ? handler(req, res) : error(res);
  };
};
