const { errorView } = require('../helpers/render');

function notFound(req, res) {
  errorView(res, 'Página não encontrada', 404);
}

function serverError(err, req, res, _next) {
  console.error('Erro interno:', err);
  if (res.headersSent) return;
  errorView(res, 'Erro interno do servidor', 500);
}

module.exports = { notFound, serverError };
