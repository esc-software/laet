const { Router } = require('express');
const { body } = require('express-validator');
const { formLimiter } = require('../middleware/rateLimit');
const { csrfProtection } = require('../middleware/csrf');
const { showForm, submitForm } = require('../controllers/formController');
const {
  nome, instagram, telefone, cpf,
  earQuantity, paymentMethod, paymentConfirmedByUser, termsAccepted
} = require('../validators/common');
const router = Router();

const formValidation = [
  nome(),
  instagram(),
  telefone(),
  cpf(),
  earQuantity(),
  paymentMethod(),
  paymentConfirmedByUser(),
  termsAccepted(),
  body('honeypot')
    .custom(value => { if (value) throw new Error('Spam detectado'); return true; })
];

router.get('/', showForm);
router.post('/', formLimiter, csrfProtection, formValidation, submitForm);

module.exports = router;
