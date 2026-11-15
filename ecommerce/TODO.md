# TODO

This list captures known engineering work and limitations visible in the
current codebase. Items are proposals until explicitly prioritized.

## Reliability and testing

- [ ] Add backend unit/integration tests for authentication, role permissions,
  products, cart stock validation, policies, complaints, and chat errors.
- [ ] Add frontend tests for protected routes, chat interaction, and complaint
  confirmation.
- [ ] Add lint, test, and build scripts to `package.json`.
- [ ] Verify and document supported Node.js and MongoDB versions.
- [ ] Add a deployment health check that reports database and Ollama readiness.

## Product and UX

- [ ] Configure the frontend API base URL through Vite environment settings.
- [ ] Add persistent chat history only after deciding storage, privacy, and
  retention requirements.
- [ ] Improve chatbot complaint intent handling for varied language and
  accidental keyword matches.
- [ ] Add explicit currency configuration and consistent display across the
  catalog, cart, and chatbot.
- [ ] Add order and checkout workflows only after selecting a payment and
  fulfillment design.

## Security and operations

- [ ] Review CORS policy and configure allowed production origins.
- [ ] Review request body limits and per-route rate limits, including chat.
- [ ] Define production secret management, MongoDB backup, and recovery
  procedures.
- [ ] Add structured logs and avoid exposing internal error details to clients.
- [ ] Review owner-account bootstrap and invite-key rotation procedures.

## Chatbot

- [ ] Consider persistent embedding storage if catalog size or startup latency
  grows.
- [ ] Add evaluation prompts and expected-answer checks for catalog and policy
  questions.
- [ ] Add answer confidence/fallback thresholds and test citation/source
  relevance.
