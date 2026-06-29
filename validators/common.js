const { body } = require('express-validator');

const nome = () =>
  body('nome')
    .trim()
    .notEmpty().withMessage('Nome é obrigatório')
    .isLength({ min: 3, max: 100 }).withMessage('Nome deve ter entre 3 e 100 caracteres')
    .escape();

const instagram = () =>
  body('instagram')
    .trim()
    .notEmpty().withMessage('Instagram é obrigatório')
    .isLength({ min: 2, max: 50 }).withMessage('Instagram inválido')
    .customSanitizer(value => value.replace(/^@/, '').trim())
    .escape();

const telefone = () =>
  body('telefone')
    .trim()
    .notEmpty().withMessage('Telefone é obrigatório')
    .matches(/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/).withMessage('Telefone inválido. Ex: (11) 99999-9999');

const cpf = () =>
  body('cpf')
    .trim()
    .notEmpty().withMessage('CPF é obrigatório');

const earQuantity = () =>
  body('earQuantity')
    .notEmpty().withMessage('Selecione a quantidade de orelhas')
    .isIn([0, 1, 2]).withMessage('Quantidade inválida');

const paymentMethod = () =>
  body('paymentMethod')
    .custom((value, { req }) => {
      const qtd = parseInt(req.body.earQuantity);
      if (qtd > 0 && !value) {
        throw new Error('Selecione a forma de pagamento');
      }
      if (value && !['credit', 'pix'].includes(value)) {
        throw new Error('Forma de pagamento inválida');
      }
      return true;
    });

const paymentConfirmedByUser = () =>
  body('paymentConfirmedByUser')
    .custom((value, { req }) => {
      const qtd = parseInt(req.body.earQuantity);
      if (qtd > 0 && req.body.paymentMethod === 'pix' && value !== 'true') {
        throw new Error('Confirme que realizou o pagamento via PIX');
      }
      return true;
    });

const termsAccepted = () =>
  body('termsAccepted')
    .custom(value => {
      if (value !== 'true') {
        throw new Error('Você precisa aceitar os termos de serviço');
      }
      return true;
    });

module.exports = {
  nome, instagram, telefone, cpf,
  earQuantity, paymentMethod, paymentConfirmedByUser, termsAccepted
};
