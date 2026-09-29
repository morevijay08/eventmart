# EventMart

EventMart is a full-stack e-commerce application for browsing and purchasing electronics. It is built with a Next.js frontend and a Node.js/Express microservices backend.

## Live Application

- Frontend: https://eventmart-psi.vercel.app
- API Gateway: https://eventmart-api-gateway.onrender.com
- Product Service: https://eventmart-product-service.onrender.com
- Auth Service: https://eventmart-auth-service.onrender.com
- Cart Service: https://eventmart-cart-service.onrender.com
- Order Service: https://eventmart-order-service.onrender.com
- Payment Service: https://eventmart-payment-service.onrender.com
- Notification Service: https://eventmart-notification-service.onrender.com

> Backend service URLs expose health/API endpoints as implemented by each service. The frontend communicates with the API Gateway rather than calling individual backend services directly.

## Features

- User registration and login
- JWT-based authentication
- Customer and admin roles
- Product catalogue
- Product search
- Category and brand filtering
- Price filtering
- Product sorting
- Pagination
- Shopping cart
- Order creation and cancellation
- Order history
- Payment service with Stripe integration
- Cash-on-delivery event handling
- Email notifications through RabbitMQ events
- Admin-only product and order/payment operations
- API rate limiting and security headers

## Technology Stack

### Frontend

- Next.js 16
- React 19
- Tailwind CSS
- Axios
- js-cookie
- React Hot Toast
- Lucide React

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- RabbitMQ / AMQP
- Stripe
- Nodemailer
- HTTP Proxy Middleware

### Deployment / Infrastructure

- Vercel — frontend
- Render — backend microservices
- MongoDB Atlas — database
- CloudAMQP — RabbitMQ
- Stripe — payment processing

## Architecture

```text
                         ┌──────────────────────┐
                         │       Customer       │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │   Next.js Frontend  │
                         │       Vercel         │
                         └──────────┬───────────┘
                                    │ HTTPS
                                    ▼
                         ┌──────────────────────┐
                         │     API Gateway      │
                         │       Render         │
                         └──────────┬───────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
              ▼                     ▼                     ▼
       ┌─────────────┐       ┌─────────────┐       ┌─────────────┐
       │ Auth Service│       │Product      │       │Cart Service │
       │             │       │Service      │       │             │
       └──────┬──────┘       └──────┬──────┘       └──────┬──────┘
              │                     │                     │
              ▼                     ▼                     ▼
          MongoDB                MongoDB                MongoDB

              ┌─────────────────────┬─────────────────────┐
              │                     │                     │
              ▼                     ▼                     ▼
       ┌─────────────┐       ┌─────────────┐       ┌──────────────┐
       │Order Service│       │Payment      │       │Notification  │
       │             │       │Service      │       │Service       │
       └──────┬──────┘       └──────┬──────┘       └──────┬───────┘
              │                     │                     │
              ▼                     ▼                     │
          MongoDB               MongoDB                   │
                                    │                     │
                                    └─────────┬───────────┘
                                              ▼
                                      ┌──────────────┐
                                      │  RabbitMQ    │
                                      │ CloudAMQP    │
                                      └──────────────┘

                                      Payment Service
                                             │
                                             ▼
                                        ┌─────────┐
                                        │ Stripe  │
                                        └─────────┘
```

## Repository Structure

```text
eventmart/
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── services/
│   ├── api-gateway/
│   ├── auth-service/
│   ├── cart-service/
│   ├── notification-service/
│   ├── order-service/
│   ├── payment-service/
│   └── product-service/
│
└── README.md
```

## Backend Services

| Service | Responsibility |
|---|---|
| API Gateway | Single entry point for frontend API requests and service proxying |
| Auth Service | Registration, login, JWT authentication and user roles |
| Product Service | Product catalogue, search, filters, reviews and admin product operations |
| Cart Service | User shopping cart management |
| Order Service | Order creation, order history, cancellation and admin order operations |
| Payment Service | Stripe payment intents, payment records and payment events |
| Notification Service | Email notifications from RabbitMQ events |

## Database Design

MongoDB Atlas is used with separate databases for the services:

- `eventmart-auth`
- `eventmart-products`
- `eventmart-cart`
- `eventmart-orders`
- `eventmart-payments`

Each service owns its relevant database rather than sharing application collections across services.

## Event Flow

RabbitMQ is used for asynchronous communication between services.

Important events include:

- `order.created`
- `order.cancelled`
- `payment.success`
- `payment.failed`
- `order.shipped`

Example order flow:

```text
Customer creates order
        ↓
Order Service
        ↓
order.created
        ↓
RabbitMQ
        ├──→ Payment Service
        └──→ Notification Service
```

## Environment Variables

### Frontend

The frontend uses:

```env
NEXT_PUBLIC_API_URL=https://eventmart-api-gateway.onrender.com
```

For local development:

```env
NEXT_PUBLIC_API_URL=http://localhost:<API_GATEWAY_PORT>
```

### Auth Service

Typical variables:

```env
MONGO_URI=<MongoDB connection string>
JWT_SECRET=<secret>
JWT_REFRESH_SECRET=<secret>
ADMIN_EMAIL=<admin email>
```

### Product Service

```env
MONGO_URI=<MongoDB connection string>
JWT_SECRET=<secret>
PRODUCT_SERVICE_URL=<product service URL>
```

### Cart Service

```env
MONGO_URI=<MongoDB connection string>
JWT_SECRET=<secret>
PRODUCT_SERVICE_URL=<product service URL>
```

### Order Service

```env
MONGO_URI=<MongoDB connection string>
JWT_SECRET=<secret>
CART_SERVICE_URL=<cart service URL>
RABBITMQ_URL=<CloudAMQP connection string>
```

### Payment Service

```env
MONGO_URI=<MongoDB connection string>
RABBITMQ_URL=<CloudAMQP connection string>
STRIPE_SECRET_KEY=<Stripe secret key>
```

### Notification Service

```env
RABBITMQ_URL=<CloudAMQP connection string>
EMAIL_USER=<email address>
EMAIL_PASS=<email app password>
EMAIL_FROM=<sender address>
```

### API Gateway

```env
AUTH_SERVICE_URL=<auth service URL>
PRODUCT_SERVICE_URL=<product service URL>
CART_SERVICE_URL=<cart service URL>
ORDER_SERVICE_URL=<order service URL>
PAYMENT_SERVICE_URL=<payment service URL>
```

> Never commit real passwords, API keys, JWT secrets, Stripe secret keys, RabbitMQ credentials, or email app passwords to GitHub.

## Local Development

### Prerequisites

Install:

- Node.js
- npm
- MongoDB, or use MongoDB Atlas
- RabbitMQ, or a CloudAMQP instance for remote development
- Git

### Clone the repository

```bash
git clone https://github.com/morevijay08/eventmart.git
cd eventmart
```

### Install dependencies

Install dependencies separately for the frontend and each service:

```bash
cd frontend
npm install
```

For each backend service:

```bash
cd services/<service-name>
npm install
```

### Start the services

Each backend service is started from its own directory with:

```bash
npm start
```

Start the frontend with:

```bash
cd frontend
npm run dev
```

The exact local ports are controlled by each service's environment configuration.

## Product Seed Data

The Product Service contains a seed script with sample electronics products.

From:

```text
services/product-service
```

run:

```bash
npm run seed
```

The seed script recreates the product collection with the sample catalogue.

> Make sure `MONGO_URI` points to the intended database before running the seed script.

## Deployment

### Frontend — Vercel

Configuration:

- Repository: `morevijay08/eventmart`
- Branch: `main`
- Root Directory: `frontend`
- Framework: Next.js
- Install Command: `npm install`
- Build Command: `npm run build`

Environment variable:

```env
NEXT_PUBLIC_API_URL=https://eventmart-api-gateway.onrender.com
```

### Backend — Render

Each backend service is deployed as an individual Render Web Service.

For each service:

- Build Command: `npm install`
- Start Command: `npm start`
- Environment: Free
- Do not hard-code Render's `PORT`; use `process.env.PORT`

Service root directories:

```text
services/api-gateway
services/auth-service
services/cart-service
services/notification-service
services/order-service
services/payment-service
services/product-service
```

### MongoDB — Atlas

MongoDB Atlas provides the cloud databases used by the backend services.

### RabbitMQ — CloudAMQP

CloudAMQP provides the hosted RabbitMQ broker used for asynchronous service events.

### Stripe

Stripe is used by the Payment Service for payment processing. Test/Sandbox credentials should be used while testing the application.

## API Gateway Routes

The frontend communicates with the API Gateway.

| Route | Purpose |
|---|---|
| `/api/auth` | Authentication |
| `/api/products` | Products |
| `/api/cart` | Shopping cart |
| `/api/orders` | Orders |
| `/api/payments` | Payments |
| `/health` | Gateway health check |

## Testing Checklist

Before considering the deployment complete, test:

- [ ] Homepage loads
- [ ] Products load
- [ ] Product search
- [ ] Category filtering
- [ ] Brand filtering
- [ ] Price filtering
- [ ] User registration
- [ ] User login
- [ ] Add to cart
- [ ] View cart
- [ ] Create order
- [ ] Order history
- [ ] Payment flow in Stripe test mode
- [ ] Order cancellation
- [ ] Notification events
- [ ] Admin authentication
- [ ] Admin product management
- [ ] Admin order/payment views

## Security Notes

- Do not commit `.env` files containing secrets.
- Use environment variables for credentials.
- Use Stripe test keys during development/testing.
- Rotate credentials immediately if they are accidentally exposed.
- Use strong JWT secrets.
- Restrict MongoDB Atlas network access where practical.
- Do not expose RabbitMQ credentials publicly.
- Do not expose email app passwords publicly.

## License

This project is for educational and development purposes.
