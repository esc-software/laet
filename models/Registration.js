const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: [true, 'Nome é obrigatório'],
    trim: true,
    minlength: [3, 'Nome deve ter no mínimo 3 caracteres'],
    maxlength: [100, 'Nome deve ter no máximo 100 caracteres']
  },
  instagram: {
    type: String,
    required: [true, 'Instagram é obrigatório'],
    trim: true,
    minlength: [2, 'Instagram deve ter no mínimo 2 caracteres'],
    maxlength: [50, 'Instagram deve ter no máximo 50 caracteres']
  },
  telefone: {
    type: String,
    required: [true, 'Telefone é obrigatório'],
    trim: true,
    match: [/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/, 'Telefone inválido']
  },
  cpf: {
    type: String,
    required: [true, 'CPF é obrigatório'],
    unique: true,
    trim: true
  },
  earQuantity: {
    type: Number,
    default: null
  },
  totalValue: {
    type: Number,
    default: null
  },
  paymentMethod: {
    type: String,
    default: null
  },
  paymentStatus: {
    type: String,
    default: 'pending',
    enum: ['pending', 'paid']
  },
  paymentConfirmedAt: {
    type: Date,
    default: null
  },
  paymentConfirmedByUser: {
    type: Boolean,
    default: false
  },
  termsAccepted: {
    type: Boolean,
    default: false
  },
  ip: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

registrationSchema.index({ ip: 1 });

module.exports = mongoose.model('Registration', registrationSchema);
