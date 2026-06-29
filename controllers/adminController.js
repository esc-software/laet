const { validationResult } = require('express-validator');
const { Parser } = require('json2csv');
const ExcelJS = require('exceljs');
const mongoose = require('mongoose');
const Registration = require('../models/Registration');
const cpf = require('../utils/cpf');
const { escapeRegex } = require('../utils/sanitize');
const { adminLogin, adminDashboard, adminCreate } = require('../helpers/render');
const { UNIT_PRICE, PAGINATION_LIMIT } = require('../constants');

function showLogin(req, res) {
  if (req.session.authenticated) return res.redirect('/admin');
  adminLogin(res);
}

function login(req, res) {
  const { user, pass } = req.body;
  if (user === process.env.ADMIN_USER && pass === process.env.ADMIN_PASS) {
    req.session.authenticated = true;
    return res.redirect('/admin');
  }
  adminLogin(res, 'Credenciais inválidas');
}

function logout(req, res) {
  req.session.destroy(() => {
    res.redirect('/admin/login');
  });
}

async function dashboard(req, res) {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = PAGINATION_LIMIT;
  const skip = (page - 1) * limit;
  const search = (req.query.search || '').trim();
  const paymentFilter = req.query.payment || '';

  const query = {};

  if (paymentFilter === 'pending' || paymentFilter === 'paid') {
    query.paymentStatus = paymentFilter;
  }

  if (search) {
    const safe = escapeRegex(search);
    const searchQuery = [
      { nome: { $regex: safe, $options: 'i' } },
      { instagram: { $regex: safe, $options: 'i' } },
      { cpf: { $regex: safe, $options: 'i' } }
    ];
    if (query.$or) {
      query.$and = [{ $or: query.$or }, { $or: searchQuery }];
      delete query.$or;
    } else {
      query.$or = searchQuery;
    }
  }

  const [registrations, total] = await Promise.all([
    Registration.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Registration.countDocuments(query)
  ]);

  adminDashboard(res, {
    registrations,
    page,
    total,
    totalPages: Math.ceil(total / limit) || 1,
    search,
    paymentFilter,
    message: req.query.message || null
  });
}

function showCreate(req, res) {
  adminCreate(res);
}

async function create(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return adminCreate(res, { errors: errors.array(), old: req.body });
  }

  if (!cpf.validate(req.body.cpf)) {
    return adminCreate(res, { errors: [{ msg: 'CPF inválido' }], old: req.body });
  }

  try {
    const earQuantity = (() => {
      const n = parseInt(req.body.earQuantity);
      return isNaN(n) ? null : n;
    })();

    const registration = new Registration({
      nome: req.body.nome.trim(),
      instagram: req.body.instagram.trim().replace(/^@/, ''),
      telefone: req.body.telefone.trim(),
      cpf: req.body.cpf.replace(/\D/g, ''),
      earQuantity,
      totalValue: earQuantity != null && earQuantity > 0 ? earQuantity * UNIT_PRICE : null,
      paymentMethod: earQuantity > 0 ? (req.body.paymentMethod || null) : null,
      termsAccepted: req.body.termsAccepted === 'true'
    });

    await registration.save();
    res.redirect('/admin?message=Cadastro criado com sucesso');
  } catch (err) {
    if (err.code === 11000) {
      return adminCreate(res, { errors: [{ msg: 'CPF já cadastrado' }], old: req.body });
    }
    console.error('Erro ao criar:', err);
    adminCreate(res, { errors: [{ msg: 'Erro ao criar cadastro' }], old: req.body });
  }
}

async function remove(req, res) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.redirect('/admin?message=ID inválido');
  }
  try {
    const result = await Registration.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.redirect('/admin?message=Cadastro não encontrado');
    }
    res.redirect('/admin?message=Cadastro removido com sucesso');
  } catch (err) {
    console.error('Erro ao remover:', err);
    res.redirect('/admin?message=Erro ao remover cadastro');
  }
}

async function confirmPayment(req, res) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.redirect('/admin?message=ID inválido');
  }
  try {
    const result = await Registration.findByIdAndUpdate(
      req.params.id,
      { paymentStatus: 'paid', paymentConfirmedAt: new Date() },
      { new: true }
    );
    if (!result) {
      return res.redirect('/admin?message=Cadastro não encontrado');
    }
    res.redirect('/admin?message=Pagamento confirmado com sucesso');
  } catch (err) {
    console.error('Erro ao confirmar pagamento:', err);
    res.redirect('/admin?message=Erro ao confirmar pagamento');
  }
}

async function exportCsv(req, res) {
  const registrations = await Registration.find().sort({ createdAt: -1 }).lean();

  const fields = [
    { label: 'Nome', value: 'nome' },
    { label: 'Instagram', value: 'instagram' },
    { label: 'Telefone', value: 'telefone' },
    { label: 'CPF', value: 'cpf' },
    { label: 'Orelhas', value: 'earQuantity' },
    { label: 'Valor Total', value: 'totalValue' },
    { label: 'Pagamento', value: row => row.paymentMethod === 'pix' ? 'PIX' : 'Cartão' },
    { label: 'Status', value: row => row.paymentStatus === 'paid' ? 'Pago' : 'Pendente' },
    { label: 'IP', value: 'ip' },
    { label: 'Data', value: 'createdAt' }
  ];

  const csv = new Parser({ fields }).parse(registrations);

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename=cadastros.csv');
  res.send('\uFEFF' + csv);
}

async function exportExcel(req, res) {
  const registrations = await Registration.find().sort({ createdAt: -1 }).lean();

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Laet';
  const worksheet = workbook.addWorksheet('Cadastros');

  worksheet.columns = [
    { header: 'Nome', key: 'nome', width: 30 },
    { header: 'Instagram', key: 'instagram', width: 25 },
    { header: 'Telefone', key: 'telefone', width: 20 },
    { header: 'CPF', key: 'cpf', width: 18 },
    { header: 'Orelhas', key: 'earQuantity', width: 10 },
    { header: 'Valor', key: 'totalValue', width: 12 },
    { header: 'Pagamento', key: 'paymentMethod', width: 15 },
    { header: 'Status', key: 'paymentStatus', width: 12 },
    { header: 'IP', key: 'ip', width: 20 },
    { header: 'Data', key: 'createdAt', width: 25 }
  ];

  worksheet.getRow(1).font = { bold: true };

  for (const reg of registrations) {
    worksheet.addRow({
      nome: reg.nome,
      instagram: reg.instagram,
      telefone: reg.telefone,
      cpf: reg.cpf,
      earQuantity: reg.earQuantity ? reg.earQuantity + 'x' : '-',
      totalValue: reg.totalValue ? 'R$ ' + reg.totalValue.toLocaleString('pt-BR') : '-',
      paymentMethod: reg.paymentMethod === 'pix' ? 'PIX' : reg.paymentMethod === 'credit' ? 'Cartão' : '-',
      paymentStatus: reg.paymentStatus === 'paid' ? 'Pago' : 'Pendente',
      ip: reg.ip || '-',
      createdAt: reg.createdAt ? new Date(reg.createdAt).toLocaleString('pt-BR') : '-'
    });
  }

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=cadastros.xlsx');
  await workbook.xlsx.write(res);
  res.end();
}

module.exports = {
  showLogin, login, logout, dashboard,
  showCreate, create, remove, confirmPayment,
  exportCsv, exportExcel
};
