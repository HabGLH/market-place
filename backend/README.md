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

## 4. Error Handling

The application uses a standardized `AppError` class.

- **Operational Errors**: Thrown explicitly (e.g., 404 Not Found, 400 Bad Request).
- **System Errors**: Caught by the global error handler (500 Internal Server Error).
- **Logging**: All errors are logged to `logs/error.log`.

## 5. Testing

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
