# API Reference

Default backend base URL: `http://localhost:5000`. API routes are under `/api`.
JSON request bodies are expected. Protected routes use:

```http
Authorization: Bearer <JWT>
```

JWTs are returned by login and currently expire after seven days.

## Health and root

| Method | Path | Access | Description |
| --- | --- | --- | --- |
| GET | `/` | Public | Confirms the Ecommerce API is running. |

## Authentication — `/api/auth`

| Method | Path | Access | Request body |
| --- | --- | --- | --- |
| POST | `/signup` | Public | `{ "name", "email", "password", "role?": "customer" \| "owner", "ownerSignupKey?" }` |
| POST | `/login` | Public | `{ "email", "password", "role?" }` |
| POST | `/forgot-password` | Public, rate-limited | `{ "email" }` |
| POST | `/reset-password` | Public, rate-limited | `{ "email", "otp", "password", "confirmPassword" }` |

Owner signup must use the configured `OWNER_EMAIL` and `OWNER_SIGNUP_KEY`.
Successful login returns `{ "message", "token", "user": { "id", "name",
"email", "role" } }`. Password-reset routes are limited to five requests per
15-minute window.

## Products — `/api/products`

| Method | Path | Access | Request body |
| --- | --- | --- | --- |
| GET | `/` | Public | — |
| GET | `/:id` | Public | — |
| POST | `/` | Owner | `{ "name", "description", "price", "image", "category", "stock?" }` |
| PUT | `/:id` | Owner | Any supported product fields: `name`, `description`, `price`, `image`, `category`, `stock` |
| DELETE | `/:id` | Owner | — |

List response shape: `{ "products": [...] }`. Product stock must be a
non-negative integer; price must be non-negative.

## Cart — `/api/cart`

All cart endpoints require an authenticated customer.

| Method | Path | Request body |
| --- | --- | --- |
| GET | `/` | — |
| POST | `/add` | `{ "productId": "<MongoDB ObjectId>", "quantity?": 1 }` |
| POST | `/remove` | `{ "productId": "<MongoDB ObjectId>" }` |

The add endpoint adds the supplied quantity to the current cart quantity and
rejects quantities exceeding current stock. An empty cart may return HTTP 404
with a `cart not found` message.

## Complaints — `/api/complaints`

| Method | Path | Access | Request body |
| --- | --- | --- | --- |
| POST | `/` | Customer | `{ "productName", "description", "category?" }` |
| GET | `/` | Customer or owner | — |
| PUT | `/:id` | Owner | `{ "status": "Pending" \| "In Progress" \| "Resolved" }` |

Customers receive only their own complaints; owners receive all complaints.
New complaints are created as `Pending`. The chatbot complaint widget collects
the product and description, asks for confirmation, then calls this existing
customer-authenticated endpoint. A chat message alone does not create a
complaint.

## Policies — `/api/policy`

| Method | Path | Access | Request body |
| --- | --- | --- | --- |
| GET | `/` | Authenticated user | — |
| POST | `/` | Owner | `{ "policyType": "Exchange" \| "Refund" \| "Shipping" \| "FAQ", "title", "content" }` |
| PUT | `/:id` | Owner | `{ "policyType", "title", "content" }` |
| DELETE | `/:id` | Owner | — |

## Chat — `/api/chat`

| Method | Path | Access | Request body |
| --- | --- | --- | --- |
| POST | `/` | Public for questions | `{ "message": "..." }` |

Message must be a non-empty string of at most 2,000 characters. Successful
response:

```json
{
  "answer": "Assistant response",
  "sources": [
    { "title": "Product or knowledge title", "type": "product", "similarity": 0.81 }
  ]
}
```

The chatbot uses Ollama and knowledge built from MongoDB products/policies and
the company, FAQ, and policy text files. If Ollama is unavailable or fails, the
route returns HTTP 503 with an error message. Complaint submission is performed
separately through the authenticated complaints endpoint after confirmation.

## Common errors

- `400` — invalid or missing request data.
- `401` — missing/invalid authentication or account no longer exists.
- `403` — insufficient role or owner signup configuration/key mismatch.
- `404` — record or cart not found.
- `409` — email already registered.
- `429` — password-reset rate limit exceeded.
- `500` — unexpected server/database failure.
- `503` — service not configured or chatbot model unavailable.
