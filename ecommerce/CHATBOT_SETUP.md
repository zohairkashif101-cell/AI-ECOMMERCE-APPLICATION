# Store chatbot setup

The chatbot is available from the floating chat button on every page. It uses the
store's live MongoDB products and policies, plus the company, FAQ, and policy
reference files in `backend/src/ai/knowledge/`.

## Requirements

1. Install and start [Ollama](https://ollama.com/).
2. Download the default chat and embedding models:

   ```sh
   ollama pull llama3.2
   ollama pull nomic-embed-text
   ```

3. Add these settings to the project root `.env` if you want to override the
   defaults:

   ```env
   OLLAMA_URL=http://localhost:11434
   OLLAMA_MODEL=llama3.2
   EMBEDDINGS_MODEL=nomic-embed-text
   ```

4. Start MongoDB and the backend as usual (`npm run server`), then start the
   frontend (`npm run client`).

The backend creates embeddings for current product and policy records and caches
them in memory. A product or policy change automatically refreshes that cache
when the next chat request arrives. The chat API is `POST /api/chat` with
`{ "message": "..." }`; it returns an answer and the knowledge sources used.
The chatbot does not place orders or process payments.

Product data comes from MongoDB rather than a second JSON catalog, so answers
stay aligned with the products and stock shown in the shop. Product prices are
in USD, matching the current storefront.

Customers can also start a complaint from the chat widget. The chatbot asks for
the product and issue, shows a summary, and submits only after the customer
confirms. It uses the existing authenticated complaints API, so the complaint is
saved to MongoDB and appears in the owner's Complaint Dashboard. Customers must
be signed in; guests can still use the chat for store questions.
