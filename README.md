# FoodExpress — Order Management

An Order Management feature for a food delivery app: browse a menu, build a
cart, check out, and track order status in real time.

- **Frontend**: React (Vite) + Tailwind CSS + React Router
- **Backend**: Node.js + Express + Prisma + MySQL
- **Auth**: optional. Checkout works as a guest (no login) exactly as the
  brief describes — name/address/phone are entered per order. Logging in
  (passwordless email OTP) is a bonus on top: it ties order history to your
  account across devices instead of just this browser, nothing more is
  gated behind it
- **Order history**: "My Orders" works for everyone. Guests get a history
  scoped to their browser (order ids kept in `localStorage`); logged-in
  users get a history scoped to their account (kept server-side), so it
  follows them across devices
- **Real-time**: Socket.IO (simulates status progression on the server)
- **Testing**: Jest + Supertest (backend), Vitest + React Testing Library (frontend)

## Project Structure

```
Assasment/
├── client/   # Vite + React + Tailwind frontend
└── server/   # Express + Prisma + MySQL + Socket.IO backend
```

## Prerequisites

- Node.js 18+
- A running MySQL server

## Backend Setup

```bash
cd server
npm install
cp .env.example .env   # edit DATABASE_URL, PORT, CLIENT_ORIGIN, JWT_SECRET as needed
npx prisma migrate dev
node prisma/seed.js
npm run dev             # starts on http://localhost:4000
```

Run the backend test suite:

```bash
cd server
npm test
```

## Frontend Setup

```bash
cd client
npm install
cp .env.example .env   # edit VITE_API_BASE_URL / VITE_SOCKET_URL if needed
npm run dev             # starts on http://localhost:5173
```

Run the frontend test suite:

```bash
cd client
npm test
```

## API Endpoints

| Method | Path                     | Description                                            | Auth |
| ------ | ------------------------ | ------------------------------------------------------- | ---- |
| POST   | `/api/auth/request-otp`  | Send a 6-digit code to an email                          | No |
| POST   | `/api/auth/verify-otp`   | Verify the code (`name` required for new emails), returns a JWT | No |
| GET    | `/api/auth/me`           | Get the current user                                     | Yes |
| GET    | `/api/menu`              | List all menu items                                      | No |
| GET    | `/api/menu/:id`          | Get a single menu item                                   | No |
| POST   | `/api/orders`            | Place an order (starts status sim)                       | Optional |
| GET    | `/api/orders/:id`        | Get an order and its status                               | Optional* |
| GET    | `/api/orders`            | List the current user's order history                    | Yes |

\* Guest orders (placed while logged out) are viewable by anyone with the
order id/link — the same "track by link" behavior the brief describes.
Orders placed while logged in are private to that user.

Placing and tracking an order **never requires an account** — send no
`Authorization` header and it works exactly like the guest flow in the
brief. If you do send `Authorization: Bearer <token>` (from
`/api/auth/verify-otp`), the order is tied to your account instead, and
shows up in `GET /api/orders` ("My Orders" in the UI).

### Optional Email OTP Login

Logging in is not required to place or track an order — see above. It's an
extra: log in to see a history of your own past orders. There's no
password:

1. `POST /api/auth/request-otp { "email": "you@example.com" }` — generates a
   6-digit code (expires in 10 minutes) and "sends" it.
2. `POST /api/auth/verify-otp { "email", "code", "name" }` — `name` is only
   required the first time a given email logs in (it creates the account);
   returns `{ user, token }` on success.

**Delivery is simulated**, not wired to a real provider: the code is logged
to the server console, and outside of `NODE_ENV=production` it's also
returned in the `request-otp` response as `devCode` so the frontend can show
it directly (see the amber banner on the login page) — no email inbox
needed for local development or grading. To send real emails, swap the
`console.log` in `server/src/services/otp.service.js` for a call to an email
API (e.g. [Brevo](https://www.brevo.com), which has a free tier for email —
note their SMS sending is pay-as-you-go, not free).

## Real-time Order Status

When an order is placed, the backend schedules automatic status transitions
(`RECEIVED` → `PREPARING` → `OUT_FOR_DELIVERY` → `DELIVERED`) and pushes each
update over Socket.IO to clients that joined that order's room. The frontend
joins the room from the order status page and updates the tracker live,
without polling or refreshing.

## Deployment

- **Backend**: deploy to [Railway](https://railway.app) (Node.js + MySQL,
  supports persistent WebSocket connections). Set `DATABASE_URL`,
  `CLIENT_ORIGIN` (the deployed frontend URL), `JWT_SECRET` (a long random
  string), and run `npx prisma migrate deploy` + `node prisma/seed.js` once.
- **Frontend**: deploy to [Vercel](https://vercel.com) or
  [Netlify](https://netlify.com). Set `VITE_API_BASE_URL` and
  `VITE_SOCKET_URL` to the deployed backend URL.
