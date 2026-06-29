const rateLimit = require('express-rate-limit');
const { errorView } = require('../helpers/render');
const { RATE_LIMIT_WINDOW, RATE_LIMIT_MAX } = require('../constants');

const formLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW,
  max: RATE_LIMIT_MAX,
  handler: (req, res) => errorView(res, 'Muitas tentativas. Aguarde 15 minutos.', 429),
  standardHeaders: true,
  legacyHeaders: false
});

const loginLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW,
  max: RATE_LIMIT_MAX,
  handler: (req, res) => errorView(res, 'Muitas tentativas de login. Aguarde 15 minutos.', 429),
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = { formLimiter, loginLimiter };
