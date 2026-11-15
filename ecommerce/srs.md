# Software Requirements Specification

## 1. Purpose

This document describes the functional and non-functional requirements for the
Ecommerce Store application. It reflects the current Node.js, Express,
MongoDB/Mongoose, React, Vite, and Ollama implementation.

## 2. System context

- **Frontend:** React single-page application served by Vite.
- **Backend:** Express JSON API, normally on port 5000.
- **Database:** MongoDB accessed through Mongoose.
- **Language models:** Ollama chat and embedding APIs.
- **Email:** SMTP for account password-reset codes.

## 3. Functional requirements

### 3.1 User accounts

- The system shall support `customer` and `owner` roles.
- Signup shall require a name, email, and password with at least six characters.
- Owner signup shall require an email matching `OWNER_EMAIL` and a matching
  `OWNER_SIGNUP_KEY`.
- Passwords shall be stored as bcrypt hashes.
- Successful login shall issue a JWT valid for seven days.
- Password reset shall send a six-digit OTP by email when SMTP is configured.
- OTPs shall expire after ten minutes and allow no more than five attempts.

### 3.2 Products

- Product records shall have a name, description, non-negative price, integer
  stock, image, and category.
- Visitors shall be able to list products and retrieve one product.
- Only owners shall create, update, or delete products.

### 3.3 Cart

- Each cart shall belong to a customer and contain product references and
  positive item quantities.
- Only customers shall retrieve or modify a cart.
- Add-to-cart shall validate product IDs and available stock.
- Removing an item shall remove that product from the current customer's cart.

### 3.4 Policies

- Policies shall include a type, title, and content.
- Valid types are `Exchange`, `Refund`, `Shipping`, and `FAQ`.
- Authenticated users shall read policies; only owners shall write or delete
  them.

### 3.5 Complaints

- A complaint shall include the customer name, product name, description, and
  status; category defaults to `General`.
- Status shall be one of `Pending`, `In Progress`, or `Resolved`.
- Customers shall create complaints and list only their own complaints.
- Owners shall list all complaints and update complaint status.
- The chatbot complaint flow shall submit as the signed-in customer only after
  explicit confirmation.

### 3.6 Chatbot

- `POST /api/chat` shall accept a non-empty message no longer than 2,000
  characters.
- The backend shall retrieve product and policy data from MongoDB and company,
  FAQ, and policy reference text from files.
- The backend shall use Ollama embeddings to rank relevant knowledge and
  Ollama generation to produce the answer.
- Responses shall include source titles and similarity values.
- Ollama/network/model errors shall return an explicit service-unavailable
  response rather than a fabricated answer.
- Chatbot complaint intake shall use the existing protected complaint API; it
  shall not bypass customer authentication or confirmation.

## 4. Non-functional requirements

### Security

- Owner/customer access shall be checked server-side.
- Passwords shall not be returned from API responses.
- Secrets shall be supplied through environment variables and excluded from
  version control.
- Password reset endpoints shall be rate limited.
- The API shall use Helmet and request logging middleware.

### Reliability

- Backend startup shall fail visibly when database connection or startup data
  synchronization fails.
- Failed chat calls shall return a clear service error and be logged server-side.

### Performance

- The backend shall reuse cached knowledge embeddings while the source
  fingerprint remains unchanged.
- Chat requests depend on Ollama response latency; API model requests currently
  allow a timeout of up to 120 seconds.

### Usability

- The frontend shall provide customer/owner-specific navigation and protected
  pages.
- The chatbot widget shall display pending, success, and error states.
- Complaint submission shall show a review/confirmation step.

## 5. Data requirements

| Entity | Core fields |
| --- | --- |
| User | name, unique email, password hash, role, reset OTP metadata |
| Product | name, description, price, stock, image, category |
| Cart | customer user ID, product IDs, quantities |
| Policy | type, title, content |
| Complaint | customer ID/name, product, category, description, status, reply, AI analysis |

## 6. Interfaces

- Browser frontend: Vite development server; default URL is
  `http://localhost:5173`.
- Backend API: Express; default URL is `http://localhost:5000`.
- MongoDB: `MONGO_URI`.
- Ollama: `OLLAMA_URL`, default `http://localhost:11434`.
- SMTP: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, and optional
  `SMTP_FROM`.

See [API.md](./API.md) for routes and payload shapes.

## 7. Constraints

- The frontend API base URL is currently fixed to `http://localhost:5000/api`.
- Chatbot functionality requires MongoDB and Ollama to be available.
- The current application does not implement checkout or payment processing.
- The repository does not currently define an application-specific automated
  test command.
