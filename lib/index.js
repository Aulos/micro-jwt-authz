module.exports = (expectedScopes, options) => handler => {
  if (!Array.isArray(expectedScopes)) {
    throw new Error(
      'Parameter expectedScopes must be an array of strings representing the scopes for the endpoint(s)'
    );
  }

  options = options || {};
  const customJwtKey = options.customJwtKey || 'jwt';

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

    let scopeKey = 'scope';
    if (
      options.customScopeKey != null &&
      typeof options.customScopeKey === 'string'
    ) {
      scopeKey = options.customScopeKey;
    }

    const user = req[customJwtKey];
    if (!user) {
      return error(res);
    }

    const rawScope = user[scopeKey];
    let userScopes = [];
    if (typeof rawScope === 'string') {
      userScopes = rawScope.split(' ');
    } else if (Array.isArray(rawScope)) {
      userScopes = rawScope;
    } else {
      return error(res);
    }

    const allowed = expectedScopes[options.checkAllScopes ? 'every' : 'some'](
      scope => userScopes.includes(scope)
    );

    return allowed ? handler(req, res) : error(res);
  };
};
