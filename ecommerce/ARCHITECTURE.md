# Architecture

## Overview

```text
Browser
  React + React Router (Vite, normally :5173)
      |
      | JSON /api requests, optional Bearer JWT
      v
  Express API (normally :5000)
      |                         |
      | Mongoose                | Ollama HTTP API
      v                         v
  MongoDB                 Chat model + embedding model
```

## Frontend

- Entry point: `frontend/src/main.jsx`.
- Route composition: `frontend/src/App.jsx`.
- Shared navigation and protected route handling live under
  `frontend/src/components/`.
- Pages live under `frontend/src/pages/`.
- Axios API client and JWT header handling are in
  `frontend/src/services/api.js`.
- The chatbot widget is mounted in the shared application layout and is
  available across routes.

## Backend

- `backend/src/server.js` loads the root `.env`, connects to MongoDB, runs
  startup synchronization, then starts the HTTP server.
- `backend/src/app.js` configures Helmet, Morgan, CORS, JSON parsing, the
  application-wide rate limiter, and API routes.
- Route handlers are separated into `routes/`, `controllers/`,
  `middleware/`, and Mongoose `models/`.
- `authMiddleware` verifies JWTs and loads the user's current role from MongoDB.
- `authorizeRoles` enforces customer/owner access on protected operations.
- `startup/syncStoreData.js` ensures catalog products exist and promotes the
  configured owner email to the owner role when that account exists.

## Data model

- **User:** identity, unique normalized email, bcrypt password hash, role, and
  password-reset OTP metadata.
- **Product:** name, description, price, stock, image, category.
- **Cart:** customer reference and product/quantity items.
- **Policy:** policy type, title, and content.
- **Complaint:** customer reference/name, product, category, description,
  status, response, owner notice, and AI analysis.

## Chatbot request flow

1. The React widget posts a question to `POST /api/chat`.
2. `chatService` loads current products and policies from MongoDB and reads
   company, FAQ, and policy text files from `backend/src/ai/knowledge/`.
3. It fingerprints those documents and reuses in-memory embeddings if their
   content has not changed.
4. Ollama creates an embedding for the question; cosine similarity selects
   relevant context.
5. Ollama generates a grounded answer; the API returns the answer and source
   metadata.
6. For a complaint, the widget collects product and issue details, displays a
   summary, and waits for customer confirmation. It then calls the existing
   `/api/complaints` route with the customer's JWT. Complaint persistence and
   owner visibility use the normal complaint system.

## Configuration and runtime dependencies

- Root `.env`: database, JWT, owner bootstrap, SMTP, and Ollama configuration.
- MongoDB must be reachable before backend startup completes.
- Ollama must be reachable for chat requests.
- The frontend currently points to `http://localhost:5000/api` directly; this
  should be environment-configurable before deployment to multiple environments.

## Known design limits

- Embeddings are in process memory, not persisted in a vector database.
- The chat service embeds documents sequentially when refreshing its cache.
- There is no order, checkout, or payment subsystem.
- Chat API messages do not automatically submit complaints; the widget invokes
  the separate complaint endpoint after explicit customer confirmation.
