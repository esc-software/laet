const crypto = require('crypto');
const { errorView } = require('../helpers/render');

function generateToken(session) {
  if (!session.csrfToken) {
    session.csrfToken = crypto.randomBytes(32).toString('hex');
  }
  return session.csrfToken;
}

function csrfProtection(req, res, next) {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    const token = req.body._csrf || req.headers['x-csrf-token'];
    if (!token || token !== req.session.csrfToken) {
      return errorView(res, 'Token CSRF inválido', 403);
    }
  }
  next();
}

function csrfTokenMiddleware(req, res, next) {
  res.locals.csrfToken = generateToken(req.session);
  next();
}

module.exports = { csrfProtection, csrfTokenMiddleware };
