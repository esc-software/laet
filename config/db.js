const mongoose = require('mongoose');

async function connect() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI não definida no .env');
    process.exit(1);
  }
  await mongoose.connect(uri);
  console.log('MongoDB conectado');
}

module.exports = { connect };
