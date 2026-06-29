const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Registration = require('../models/Registration');
const cpf = require('../utils/cpf');
const { extractIp } = require('../utils/sanitize');
const { form, success } = require('../helpers/render');
const { UNIT_PRICE, COOKIE_MAX_AGE } = require('../constants');

function showForm(req, res) {
  if (req.cookies.cadastrado === 'true') {
    return form(res, { jaCadastrado: true });
  }
  form(res);
}

async function submitForm(req, res) {
  if (req.cookies.cadastrado === 'true') {
    return form(res, { jaCadastrado: true, errors: [{ msg: 'Você já realizou o cadastro.' }], old: req.body });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return form(res, { errors: errors.array(), old: req.body });
  }

  if (!cpf.validate(req.body.cpf)) {
    return form(res, { errors: [{ msg: 'CPF inválido' }], old: req.body });
  }

  const clientIp = extractIp(req);

  try {
    const existingIp = await Registration.findOne({ ip: clientIp });
    if (existingIp) {
      return form(res, { errors: [{ msg: 'Este dispositivo já realizou um cadastro.' }], old: req.body });
    }

    const earQuantity = parseInt(req.body.earQuantity);
    const totalValue = earQuantity > 0 ? earQuantity * UNIT_PRICE : 0;
    const paymentMethod = earQuantity > 0 ? req.body.paymentMethod : null;
    const paymentConfirmedByUser = earQuantity > 0 && req.body.paymentMethod === 'pix'
      ? req.body.paymentConfirmedByUser === 'true'
      : false;
    const { termsAccepted } = req.body;

    const registration = new Registration({
      nome: req.body.nome.trim(),
      instagram: req.body.instagram.trim().replace(/^@/, ''),
      telefone: req.body.telefone.trim(),
      cpf: req.body.cpf.replace(/\D/g, ''),
      earQuantity,
      totalValue,
      paymentMethod,
      paymentStatus: 'pending',
      paymentConfirmedByUser,
      termsAccepted: termsAccepted === 'true',
      ip: clientIp,
      userAgent: req.headers['user-agent'] || null
    });

    await registration.save();

    res.cookie('cadastrado', 'true', {
      maxAge: COOKIE_MAX_AGE,
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production'
    });

    success(res, { earQuantity, totalValue, paymentMethod, paymentConfirmedByUser });
  } catch (err) {
    if (err.code === 11000) {
      return form(res, { errors: [{ msg: 'Este CPF já está cadastrado.' }], old: req.body });
    }
    if (err instanceof mongoose.Error.ValidationError) {
      return form(res, {
        errors: Object.values(err.errors).map(e => ({ msg: e.message })),
        old: req.body
      });
    }
    console.error('Erro ao salvar:', err);
    form(res, { errors: [{ msg: 'Erro interno. Tente novamente.' }], old: req.body });
  }
}

module.exports = { showForm, submitForm };
