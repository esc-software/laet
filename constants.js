module.exports = {
  UNIT_PRICE: 800,
  PRODUCT_NAME: process.env.PRODUCT_NAME || 'Aequilibrium',
  PIX_KEY: process.env.PIX_KEY || 'pix@laet.gallery',
  WHATSAPP_CONTACT: process.env.WHATSAPP_CONTACT || '+55 11 95846-6966',
  PAGINATION_LIMIT: 20,
  RATE_LIMIT_WINDOW: 15 * 60 * 1000,
  RATE_LIMIT_MAX: 5,
  COOKIE_MAX_AGE: 365 * 24 * 60 * 60 * 1000,
  ADMIN_PATH: '/admin'
};
