# Roadmap

This is a proposed direction, not a delivery commitment. Priorities and dates
should be agreed by the project owner.

## Now — stabilize the current application

- Add automated backend and frontend tests for existing flows.
- Make frontend API URL environment-configurable.
- Add consistent input validation and user-visible loading/error handling.
- Verify chatbot answers, source relevance, and complaint submission end to end.
- Review CORS, rate limits, logging, and secret rotation.

## Next — improve store operations

- Define product currency and format consistently throughout the application.
- Add pagination and search/filtering to larger product and complaint lists.
- Improve owner dashboard filters and complaint resolution workflow.
- Add a deployment/runbook, health checks, and MongoDB backup guidance.

## Later — expand commerce capabilities

- Design order creation, inventory reservation, and order history.
- Select payment provider and implement payment only with appropriate security
  and compliance review.
- Add fulfillment and delivery status tracking.
- Evaluate persistent vector search if product data and chatbot traffic justify
  it.
- Consider multilingual answers and richer chatbot evaluation.

## Planning principles

- Keep customer data private and enforce permissions in the backend.
- Do not represent an order or payment as complete until the corresponding
  workflow exists and confirms success.
- Prioritize tested, supportable behavior over adding features without
  operational ownership.
