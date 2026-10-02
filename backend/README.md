# Project Documentation

## 1. Project Overview

This project is an E-commerce Backend API built with Node.js, Express, and MongoDB. It features secure authentication (JWT with Refresh Tokens), role-based access control (Admin/User), and comprehensive management for Products, Orders, Users, and Cart.

### Key Features

- **Authentication**: Secure registration, login, logout, and token refresh.
- **Authorization**: Role-based middleware protecting Admin-only routes.
- **Product Management**: CRUD operations with soft-delete and stock management.
- **Order System**: Cart-to-Order conversion, status tracking, and history.
- **Admin Dashboard**: Analytics, user management, and global oversight.
- **Error Handling**: Standardized operational errors and file-based logging.

## 2. API Reference

### Base URL

`http://localhost:5000/api`

### Authentication (`/auth`)

| Method | Endpoint    | Access | Description                                   |
| :----- | :---------- | :----- | :-------------------------------------------- |
| `POST` | `/register` | Public | Register a new user                           |
| `POST` | `/login`    | Public | Login and receive Access/Refresh tokens       |
| `POST` | `/refresh`  | Public | Rotate refresh token to get new access token  |
| `POST` | `/logout`   | Public | Revoke refresh token and clear cookie         |
| `POST` | `/revoke`   | User   | Manually revoke all sessions for current user |

### Users (`/users`)

| Method | Endpoint       | Access | Description                            |
| :----- | :------------- | :----- | :------------------------------------- |
| `GET`  | `/me`          | User   | Get current user profile               |
| `PUT`  | `/me`          | User   | Update current user profile            |
| `GET`  | `/`            | Admin  | List all users                         |
| `GET`  | `/:id`         | Admin  | Get specific user details              |
| `PUT`  | `/:id/disable` | Admin  | Block a user (set `isActive: false`)   |
| `PUT`  | `/:id/enable`  | Admin  | Unblock a user (set `isActive: true`)  |
| `GET`  | `/:id/orders`  | Admin  | View order history for a specific user |

### Products (`/products`)

| Method   | Endpoint        | Access | Description                           |
| :------- | :-------------- | :----- | :------------------------------------ |
| `GET`    | `/products`     | Public | Get all active products               |
| `GET`    | `/products/:id` | Public | Get active product details            |
| `POST`   | `/products`     | Admin  | Create a new product                  |
| `PUT`    | `/products/:id` | Admin  | Update product details                |
| `DELETE` | `/products/:id` | Admin  | Soft delete a product                 |
| `GET`    | `/admin`        | Admin  | Get ALL products (including inactive) |
| `PUT`    | `/:id/enable`   | Admin  | Restore a soft-deleted product        |

### Orders (`/orders`)

| Method | Endpoint             | Access | Description                                                |
| :----- | :------------------- | :----- | :--------------------------------------------------------- |
| `POST` | `/orders`            | User   | Create an order from current Cart                          |
| `GET`  | `/orders/my`         | User   | Get logged-in user's order history                         |
| `GET`  | `/orders/:id`        | User   | Get order details (if owner)                               |
| `PUT`  | `/orders/:id/cancel` | User   | Cancel a "Pending" order                                   |
| `GET`  | `/orders`            | Admin  | Get all orders (supports `?status=X` filter)               |
| `PUT`  | `/orders/:id/status` | Admin  | Update order status (Pending → Paid → Shipped → Delivered) |

### Cart (`/cart`)

| Method   | Endpoint       | Access | Description          |
| :------- | :------------- | :----- | :------------------- |
| `GET`    | `/cart`        | User   | View current cart    |
| `POST`   | `/cart/add`    | User   | Add item to cart     |
| `PUT`    | `/cart/update` | User   | Update item quantity |
| `DELETE` | `/cart/remove` | User   | Remove specific item |
| `DELETE` | `/cart/clear`  | User   | Empty the cart       |

### Admin Dashboard (`/admin`)

| Method | Endpoint | Access | Description                                          |
| :----- | :------- | :----- | :--------------------------------------------------- |
| `GET`  | `/stats` | Admin  | Get Dashboard Analytics (Revenue, Counts, Low Stock) |

## 3. Codebase Structure

```
backend/
├── config/             # DB connection
├── controllers/        # Request handling logic (Standardized with AppError)
├── middleware/         # Auth, Role, Error, Logging, RateLimit
├── models/             # Mongoose schemas (User, Product, Order, Cart)
├── routes/             # API route definitions
├── test/               # Integration tests (Jest + Supertest)
├── utils/              # Helpers (Logger, AppError, Token utils)
├── logs/               # Application logs (error.log, request.log)
├── server.js           # Entry point
└── package.json        # Dependencies
```

## 4. Admin account setup

Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in the backend `.env` file, then run:

```bash
npm run seed:admin
```

The command creates an active admin when the email is new. If an account with
that email already exists, it promotes the account without changing its
password. Sign in at the frontend `/login` page and open `/admin`.

## 5. Error Handling

The application uses a standardized `AppError` class.

- **Operational Errors**: Thrown explicitly (e.g., 404 Not Found, 400 Bad Request).
- **System Errors**: Caught by the global error handler (500 Internal Server Error).
- **Logging**: All errors are logged to `logs/error.log`.

## 6. Testing

The project uses **Jest** and **Supertest** for integration testing, with **MongoMemoryServer** for database isolation.

### Running Tests

```bash
npm test
```

### Test Structure

- `test/setup.js`: Global setup (DB connection) and teardown.
- `test/auth.test.js`: Authentication flows.
- `test/product.test.js`: Product management.
- `test/order.test.js`: Order lifecycle.
- `test/cart.test.js`: Shopping cart operations.
- `test/user.test.js`: User profile and admin management.
- `test/admin.test.js`: Dashboard analytics.

## 7. Ethiopian checkout and Chapa

Copy `.env.example` to `.env`, then set `MONGO_URL`, `ACCESS_TOKEN_SECRET`,
`CLIENT_URL`, `CHAPA_SECRET_KEY`, `CHAPA_WEBHOOK_SECRET`,
`SHIPPING_FEE_ETB`, and `FREE_SHIPPING_THRESHOLD_ETB`. Payment amounts are
calculated by the server in ETB, with 15% VAT and configurable shipping.

The Chapa endpoint is `POST /api/payments/checkout`; it returns a checkout URL.
Cash on delivery uses `POST /api/orders` with `paymentMethod: "cod"` and a
shipping address.

In the Chapa dashboard, configure the webhook URL as
`https://<your-api-host>/api/payments/webhook` and set a random webhook secret
matching `CHAPA_WEBHOOK_SECRET`. Use a Chapa TEST secret key in
`CHAPA_SECRET_KEY`. Chapa redirects the customer back to the frontend and sends
a signed webhook. The server verifies the signature and fetches the transaction
from Chapa before marking an order paid; a browser return is not proof of
payment.

For local sandbox webhooks, expose the backend on an HTTPS tunnel and register
that public URL plus `/api/payments/webhook` in the Chapa dashboard. Backend
tests can use the installed MongoDB binary with
`MONGOMS_SYSTEM_BINARY=/usr/bin/mongod npm test -- --runInBand`.
