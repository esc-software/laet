const { Router } = require('express');
const authMiddleware = require('../middleware/auth');
const { loginLimiter } = require('../middleware/rateLimit');
const { csrfProtection } = require('../middleware/csrf');
const { nome, instagram, telefone, cpf } = require('../validators/common');
const {
  showLogin, login, logout, dashboard,
  showCreate, create, remove,
  confirmPayment,
  exportCsv, exportExcel
} = require('../controllers/adminController');

const router = Router();

const createValidation = [
  nome(),
  instagram(),
  telefone(),
  cpf()
];

router.get('/login', showLogin);
router.post('/login', loginLimiter, login);

router.post('/logout', authMiddleware, csrfProtection, logout);

router.get('/', authMiddleware, dashboard);

router.get('/criar', authMiddleware, showCreate);
router.post('/criar', authMiddleware, csrfProtection, createValidation, create);

router.post('/remover/:id', authMiddleware, csrfProtection, remove);

router.post('/confirmar-pagamento/:id', authMiddleware, csrfProtection, confirmPayment);

router.get('/exportar/csv', authMiddleware, exportCsv);
router.get('/exportar/excel', authMiddleware, exportExcel);

module.exports = router;
