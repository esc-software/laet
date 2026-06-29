require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');

const db = require('./config/db');
const { helmetConfig } = require('./config/security');
const { sessionConfig } = require('./config/session');
const { csrfTokenMiddleware } = require('./middleware/csrf');
const { notFound, serverError } = require('./middleware/errorHandler');

const { PIX_KEY, WHATSAPP_CONTACT, PRODUCT_NAME } = require('./constants');
const formRoutes = require('./routes/form');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3003;

app.locals.pixKey = PIX_KEY;
app.locals.whatsappContact = WHATSAPP_CONTACT;
app.locals.productName = PRODUCT_NAME;

db.connect();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(helmetConfig);
app.set('trust proxy', 1);
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(sessionConfig);
app.use(csrfTokenMiddleware);
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', formRoutes);
app.use('/admin', adminRoutes);

app.use(notFound);
app.use(serverError);

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
