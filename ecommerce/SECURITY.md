# Security Notes

This document records the current security boundaries and operational
expectations. It is not a security audit or a guarantee that the application is
production-ready.

## Existing controls

- Password hashes are generated with bcryptjs; password fields are excluded
  from normal Mongoose query results.
- JWTs expire after seven days.
- Protected routes verify the token and load the user's current database role.
- Owner-only product/policy/complaint operations enforce role authorization
  in backend middleware.
- Owner signup is restricted by configured email and invite key, compared with
  a timing-safe byte comparison.
- Password-reset OTPs are HMAC-hashed, expire after ten minutes, have a maximum
  of five verification attempts, and reset endpoints are rate limited.
- Helmet is enabled for HTTP security headers.
- Chat prompts treat retrieved content as data, and the model is instructed
  not to claim it placed orders or processed payments.
- Chatbot complaint submission uses the existing authenticated customer API
  and requires confirmation in the UI.

## Required handling

- Never commit `.env`, SMTP passwords, JWT secrets, owner invite keys, reset
  codes, or user data.
- Rotate any credential or invite key that has been pasted into a chat, issue,
  screenshot, or public repository.
- Use long, unique random values for `JWT_SECRET` and `OWNER_SIGNUP_KEY`.
- Restrict SMTP and MongoDB credentials to the minimum required permissions.
- Use TLS and a managed secret store in deployed environments.
- Configure CORS to trusted production origins; the current app enables CORS
  without an origin allowlist.
- Do not expose the MongoDB port publicly; use authentication and network
  controls.
- Avoid logging authentication headers, passwords, reset codes, or secret
  environment values.

## Areas needing review before production

- Add tighter chat and general API rate limiting and request-size limits.
- Review account enumeration behavior in password reset and signup responses.
- Review deployment CORS, cookie/token storage strategy, CSRF exposure, and
  frontend XSS defenses.
- Add automated authorization and input-validation tests.
- Define data retention, privacy notice, backups, audit logging, and incident
  response procedures.
- Verify that production errors do not return internal database or stack
  details.

## Reporting an issue

Do not post credentials or exploitable details in a public issue. Contact the
project maintainer privately with a concise reproduction and impact description.
