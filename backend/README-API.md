# Ecommerce Backend API - Quick Reference

Base URL (development): `http://localhost:5000/api`

This document explains how to call the backend API endpoints, authentication flow, and provides curl examples for common operations.

---

**Authentication / Token Flow**

- When a user registers or logs in the server returns an `accessToken` in the JSON response and sets a `refreshToken` in an HTTP-only cookie named `refreshToken`.
- Use the `accessToken` in the `Authorization` header for authenticated requests:

```
Authorization: Bearer <accessToken>
```

- To refresh an expired access token call `POST /api/auth/refresh` — the server reads the `refreshToken` cookie, rotates it, sets a new cookie, and returns a new `accessToken`.
- To log out call `POST /api/auth/logout` — this clears and revokes the refresh token cookie.

Security notes:

- `refreshToken` is stored as an httpOnly cookie by the server. Client-side JavaScript cannot read it.
- Always use HTTPS in production so cookies are transmitted securely.

---

## Auth Routes

Base path: `/api/auth`

- `POST /register` — Register a new user. Public.

  - Body (JSON): `{ "name": "Alice", "email": "a@example.com", "password": "secret" }`
  - Response: `201` with `{ user: { id, name, email, role }, accessToken }` and a `refreshToken` cookie.

- `POST /login` — Login existing user. Public.

  - Body (JSON): `{ "email": "a@example.com", "password": "secret" }`
  - Response: `200` with `{ user: {...}, accessToken }` and a `refreshToken` cookie.

- `POST /refresh` — Rotate refresh token + get a new access token. Requires the browser cookie to be sent.

  - Request: no body, send cookie.
  - Response: `200` with `{ accessToken }` and a refreshed `refreshToken` cookie.

- `POST /logout` — Revoke current refresh token and clear cookie.

  - Request: cookie sent automatically by client if present.
  - Response: `200` with `{ message: "Logged out successfully" }`.

- `POST /revoke` — Revoke all sessions for the authenticated user. Protected: requires `Authorization` header.
  - Body: optional
  - Response: `200` with `{ message: "All sessions revoked" }`.

### Examples

Register (curl):

```bash
curl -i -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com","password":"secret"}' \
  -c cookies.txt
```

Login (curl):

```bash
curl -i -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"secret"}' \
  -c cookies.txt
```

Refresh (curl) — uses cookie stored in `cookies.txt`:

```bash
curl -i -X POST http://localhost:5000/api/auth/refresh \
  -b cookies.txt -c cookies.txt
```

Logout (curl):

```bash
curl -i -X POST http://localhost:5000/api/auth/logout \
  -b cookies.txt -c cookies.txt
```

---

## Product Routes

Base path: `/api/products`

Public:

- `GET /` — List all active products.
- `GET /:id` — Get product details by id.

Admin (require `Authorization: Bearer <token>` and admin role):

- `POST /` — Create a product. Body: product fields.
- `PUT /:id` — Update product.
- `DELETE /:id` — Delete product.
- `GET /admin` — Admin product listing.
- `PUT /:id/enable` — Enable (activate) product.

Example (get products):

```bash
curl http://localhost:5000/api/products
```

Create product (admin):

```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -d '{"name":"Shoes","description":"Running shoes","price":59.99,"category":"footwear","stock":20}'
```

---

## Cart Routes

Base path: `/api/cart` — all routes require authentication (send `Authorization` header with Bearer token).

- `GET /` — Get current user's cart.
- `POST /add` — Add product to cart. Body: `{ "productId": "<id>", "quantity": 2 }`.
- `PUT /update` — Update quantity. Body: `{ "productId": "<id>", "quantity": 3 }`.
- `DELETE /remove` — Remove item. Body: `{ "productId": "<id>" }`.
- `DELETE /clear` — Clear all items.

Example — add to cart:

```bash
curl -X POST http://localhost:5000/api/cart/add \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -d '{"productId":"633b7f...","quantity":1}'
```

---

## Order Routes

Base path: `/api/orders`

User routes (authenticated):

- `POST /` — Create order from cart or payload. Body depends on controller implementation (usually products, paymentMethod, etc.).
- `GET /my` — Get logged-in user's orders.
- `GET /:id` — Get order details (user or admin access depending on ownership).
- `PUT /:id/cancel` — Cancel an order.

Admin routes (requires admin role):

- `GET /` — List all orders.
- `PUT /:id/status` — Update order status.

Create order example (curl):

```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -d '{"paymentMethod":"card","products":[{"productId":"633b7f...","quantity":2,"price":19.99}],"totalAmount":39.98}'
```

---

## User Routes

Base path: `/api/users`

- `GET /me` — Get current user profile (requires auth).
- `PUT /me` — Update current user profile (requires auth).

Admin-only:

- `GET /` — List all users.
- `GET /:id` — Get a specific user's details.
- `PUT /:id` — Disable (block) a user.
- `PUT /:id/enable` — Enable a user.
- `GET /:id/orders` — Get orders for a user.

Example — get current user profile:

```bash
curl http://localhost:5000/api/users/me \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

---

## Admin Routes

Base path: `/api/admin`

- `GET /stats` — Get admin dashboard stats (requires admin auth).

Example:

```bash
curl http://localhost:5000/api/admin/stats \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

---

## Common Notes & Error Handling

- Responses generally follow standard HTTP status codes. Validation or authorization errors use `4xx`, server errors use `5xx`.
- If your request requires authentication and returns `401` or `403`, check that the `Authorization` header contains a valid access token or that refresh-cookie flow is working.
- For cookie-based refresh to work with curl, use `-c` and `-b` to save and send cookies (see examples above).

## Quick Curl Workflow Example

1. Login & store cookies to `cookies.txt` and capture access token from output.
2. Use `Authorization: Bearer <accessToken>` to call protected endpoints.
3. When access token expires, call refresh using cookie file to obtain a new access token.

---

If you want, I can:

- Expand this into a full OpenAPI (Swagger) spec.
- Add sample JSON responses for each route based on the controllers.
- Generate Postman collection for easier testing.
