# Ecommerce Store

A full-stack ecommerce application with a React/Vite storefront, an Express API,
MongoDB persistence, customer and owner accounts, shopping carts, policy and
complaint management, and an Ollama-powered customer-support chatbot.

## Features

- Customer signup, login, and email one-time-code password reset.
- Configured owner signup and owner-only product, policy, and complaint actions.
- Product catalog with stock management.
- Customer shopping cart.
- Customer complaints, owner status updates, and complaint summaries.
- Store policy management.
- Chat widget for product, stock, FAQ, and policy questions.
- Chatbot complaint intake with customer confirmation before submission.

## Requirements

- Node.js and npm.
- MongoDB, local or hosted.
- Ollama running locally or at a reachable URL.
- Ollama chat and embedding models. Defaults are `llama3.2` and
  `nomic-embed-text`; see [CHATBOT_SETUP.md](./CHATBOT_SETUP.md).

## Setup

1. Install dependencies from the repository root:

   ```powershell
   npm install
   ```

2. Create a root `.env` file. Do not commit it. Set at least:

   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/simple-ecommerce
   JWT_SECRET=replace-with-a-long-random-secret
   OWNER_EMAIL=owner@example.com
   OWNER_SIGNUP_KEY=replace-with-a-long-random-invite-key
   OLLAMA_URL=http://localhost:11434
   OLLAMA_MODEL=llama3.2
   EMBEDDINGS_MODEL=nomic-embed-text
   ```

   Configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, and optionally
   `SMTP_FROM` to enable email password-reset codes. Existing environment
   variables and SMTP credentials should be kept private.

3. Ensure MongoDB and Ollama are running. Pull the configured Ollama models if
   they are not installed:

   ```powershell
   ollama pull llama3.2
   ollama pull nomic-embed-text
   ```

4. Start the API in one terminal:

   ```powershell
   npm run server
   ```

5. Start the frontend in a second terminal:

   ```powershell
   npm run client
   ```

6. Open the Vite URL printed in the frontend terminal, normally
   `http://localhost:5173`.

The API defaults to `http://localhost:5000`. The frontend currently configures
that API address in `frontend/src/services/api.js`.

## Owner account

Owner signup is restricted to the email in `OWNER_EMAIL` and requires
`OWNER_SIGNUP_KEY`. Create the owner account using the signup page. To create or
recover the configured owner account from a terminal, run:

```powershell
npm run reset-owner-password
```

The script prompts for the new password without echoing it to the terminal.
Keep MongoDB running. It creates the configured owner account if it does not
exist, or updates its password and role if it does.

## Useful commands

| Command | Purpose |
| --- | --- |
| `npm run server` | Run the backend with nodemon |
| `npm start` | Run the backend without nodemon |
| `npm run client` | Run the Vite frontend |
| `npm run reset-owner-password` | Create/recover the configured owner account |

## Documentation

- [Product requirements](./prd.md)
- [Software requirements specification](./srs.md)
- [API reference](./API.md)
- [Architecture](./ARCHITECTURE.md)
- [Security notes](./SECURITY.md)
- [Chatbot setup](./CHATBOT_SETUP.md)
- [Contributing](./CONTRIBUTING.md)
- [Changelog](./CHANGELOG.md)
- [TODO](./TODO.md)
- [Roadmap](./ROADMAP.md)

## Current limitations

- There is no checkout, payment processing, or order-management flow.
- Chat answers depend on Ollama, the configured models, and product/policy
  records available in MongoDB.
- Chat retrieval embeddings are cached in backend memory and are regenerated
  when the source knowledge changes or the backend restarts.
- The frontend API base URL is currently hard-coded to localhost.
- No automated application test suite is currently configured in `package.json`.

## License

This project declares the ISC license. See [LICENSE](./LICENSE).
