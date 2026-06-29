# Laet

Registration system for the Laet event with Ear Grillz **Aequilibrium** pre-sale — built with **Node.js**, **Express** and **MongoDB**.

## Features

- Multi-step registration form with client + server validation
- Optional Ear Grillz add-on (0, 1 or 2 ears, auto-calculated pricing)
- PIX (pay immediately) or credit card (pay at event, binding commitment)
- CPF and phone validation before advancing between steps
- Terms of service with no-refund policy
- Anti-spam (honeypot + rate limiting)
- Admin panel (session-protected)
- Payment status filter (all / pending / paid)
- Manual PIX payment confirmation
- Search, pagination and deletion
- CSV and Excel export
- CSRF protection, CSP headers
- Docker-ready

## Stack

| Layer    | Technology                                    |
| -------- | --------------------------------------------- |
| Backend  | Node.js, Express                              |
| Database | MongoDB 7+ (external)                         |
| Frontend | EJS, Tailwind CSS (CDN)                       |
| Security | Helmet, express-rate-limit, express-session   |
| Extra    | ExcelJS, json2csv                             |

## Project Structure

```
├── config/           # DB, helmet, session
├── constants.js      # App constants
├── controllers/      # Route handlers
├── helpers/          # Render helpers
├── middleware/        # Auth, CSRF, error handler, rate limit
├── models/           # Mongoose schema
├── public/           # Static assets
├── routes/           # Route definitions
├── utils/            # CPF validation, sanitize
├── validators/       # express-validator rules
├── views/            # EJS templates
└── server.js         # Entry point
```

## Quick Start

```bash
cp .env.example .env
# edit .env with your MongoDB URI and credentials
npm ci --omit=dev
npm start
```

Or with Docker:

```bash
cp .env.example .env
# edit .env with your external MongoDB URI
docker compose up -d
```

App runs on `http://localhost:3000`.

## Environment

```env
MONGO_URI=mongodb://localhost:27017/laet
SESSION_SECRET=JWTI9GidZBcPabY2Ls9FGlWFhsZ9gNfA
ADMIN_USER=uL9Omx4uUiKfrrO
ADMIN_PASS=uxvXnZtaMgbj2m7tqn71d4lY3ZSw1ufG
PORT=3000
PRODUCT_NAME=Aequilibrium
PIX_KEY=payments@store.com
WHATSAPP_CONTACT=+55 11 4002-8922
```

## Routes

### Public

| Method | Path | Description      |
| ------ | ---- | ---------------- |
| GET    | `/`  | Registration form |
| POST   | `/`  | Submit form       |

### Admin

| Method | Path                             | Description            |
| ------ | -------------------------------- | ---------------------- |
| GET    | `/admin/login`                   | Login page             |
| POST   | `/admin/login`                   | Authenticate           |
| POST   | `/admin/logout`                  | Logout                 |
| GET    | `/admin`                         | Dashboard (paginated)  |
| GET    | `/admin/criar`                   | Create registration    |
| POST   | `/admin/criar`                   | Save registration      |
| POST   | `/admin/remover/:id`             | Delete registration    |
| POST   | `/admin/confirmar-pagamento/:id` | Confirm PIX payment    |
| GET    | `/admin/exportar/csv`            | Export CSV             |
| GET    | `/admin/exportar/excel`          | Export Excel           |

## Data Model

| Field                  | Type    | Description                          |
| ---------------------- | ------- | ------------------------------------ |
| `nome`                 | String  | Full name                            |
| `instagram`            | String  | Instagram handle (no @)              |
| `telefone`             | String  | WhatsApp with mask                   |
| `cpf`                  | String  | CPF (digits only, unique)            |
| `earQuantity`          | Number  | 0, 1 or 2 (0 = not purchased)        |
| `totalValue`           | Number  | Total price (0 if not purchased)     |
| `paymentMethod`        | String  | `credit`, `pix` or `null`            |
| `paymentStatus`        | String  | `pending` or `paid`                  |
| `paymentConfirmedAt`   | Date    | Admin confirmation timestamp         |
| `paymentConfirmedByUser`| Boolean | User PIX confirmation flag          |
| `termsAccepted`        | Boolean | Terms acceptance                     |
| `ip`                   | String  | Client IP                            |
| `userAgent`            | String  | Client user-agent                    |
| `createdAt`            | Date    | Registration timestamp               |
