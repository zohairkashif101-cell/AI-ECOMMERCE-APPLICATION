# Contributing

Thanks for contributing. Keep changes focused, preserve existing customer and
owner workflows, and update the documentation when behavior or API contracts
change.

## Development setup

1. Install a supported Node.js version and npm.
2. Run `npm install` from the repository root.
3. Configure a local `.env` using the variable names in
   [README.md](./README.md). Never commit credentials.
4. Start MongoDB and, for chatbot work, Ollama with the configured models.
5. Run the backend with `npm run server` and the frontend with `npm run client`.

## Change guidelines

- Follow the existing CommonJS style in the backend and JSX/ES module style in
  the frontend.
- Keep authorization checks in backend routes/controllers; hiding a UI control
  is not authorization.
- Validate API inputs and return explicit error responses.
- Do not log passwords, tokens, OTPs, invite keys, or environment contents.
- Use MongoDB as the source of truth for products, policies, carts, and
  complaints.
- Preserve the chatbot's explicit complaint confirmation and authenticated
  customer requirement.
- Avoid adding dependencies unless existing packages cannot meet the need.
- Update `API.md`, `ARCHITECTURE.md`, `SECURITY.md`, or the user-facing setup
  docs when relevant.

## Before submitting

- Review the complete diff and remove accidental secrets or generated files.
- Run the relevant checks available for the changed area. At minimum, verify
  edited JavaScript syntax and build the frontend when tooling is available.
- Manually verify affected user flows if automated tests do not cover them.
- Include a concise summary, verification performed, and any known limitations.

## Pull requests

Use a descriptive title. Explain the problem, the implementation, security or
data implications, how the change was tested, and any follow-up work.
