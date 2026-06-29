const VIEWS = {
  form: 'index',
  success: 'success',
  error: 'error',
  adminLogin: 'admin/login',
  adminDashboard: 'admin/dashboard',
  adminCreate: 'admin/criar'
};

function form(res, options = {}) {
  const { errors = [], old = {}, jaCadastrado = false } = options;
  res.render(VIEWS.form, { jaCadastrado, errors, old });
}

function success(res, data = {}) {
  res.render(VIEWS.success, data);
}

function errorView(res, message, status = 500) {
  res.status(status).render(VIEWS.error, { message });
}

function adminLogin(res, errorMsg = null) {
  res.render(VIEWS.adminLogin, { error: errorMsg });
}

function adminDashboard(res, options = {}) {
  res.render(VIEWS.adminDashboard, options);
}

function adminCreate(res, options = {}) {
  res.render(VIEWS.adminCreate, {
    errors: options.errors || [],
    old: options.old || {},
    message: options.message || null
  });
}

module.exports = { form, success, errorView, adminLogin, adminDashboard, adminCreate };
