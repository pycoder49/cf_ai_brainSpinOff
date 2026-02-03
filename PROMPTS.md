# `PROMPTS.md`

Below are representative AI prompts used during development of this project.

---
### Building the UI
Can you build be a UI (since I'm not the best at graphic designing and front end)? I was thinking of a design where the page is sectioned off into three verical spaces, the middle being the biggest where the LLM and user conversation takes place.

On the left panel, I want two sections (one above and one below) where the section above contains "Relevant Chats" and the section below contains "Recent Chats"

On the right panel, I want three sections (one above, one in the middle, and one at the bottom). In the top section, I want a search bar and a file system with a single root where all uploads go. In the middle section I want "Recent Files" section where the user can select their recent files. At the bottom, I want a single drag and drop section to allow the user to upload new docuemnts (trigerring the chunking and vectorizing pipelines)

---

### New to JS
"I'm new to JS and here's my project idea using Cloudflare native AI development. Can you help me with understand the basics of sending/receiving and parsing requests in JS? Enough to get me started and the rest I can pick it up on the go"

---
### Wrangler
I did as AI what wrangler was used for, and it gave to me what I already had looked up on the web.

### Durable Objects for Chat Memory
"How do I use Cloudflare Durable Objects to store per-user chat history for an AI chatbot? Can you explain it in detail so I understand what they're used for? Maybe a helpful analogy.

---

### CORS in Cloudflare Workers
"Explain how CORS works in Cloudflare Workers and how to handle preflight OPTIONS requests. This is the first time I'm seeing OPTIONS and I can use this info on my other projects"

---

### Workers AI Integration
"Show me how to call Llama 3.3 using Cloudflare Workers AI inside a Worker."

---

### Routing Requests to Durable Objects
"How can I forward a request from a Cloudflare Worker to a Durable Object based on a chatId? Do I need to re-form the request or make a new request? I didn't know that body can only read once from an incoming request"

"Can you show me an example?"

---

### Frontend Chat → Worker API
"How should a browser-based chat UI send messages to a Cloudflare Worker API and handle JSON responses?"

---

### Chat History
"Can you tell me more about the localStorage and the state sessions? What data structure is the state session and how many variables/'buckets' does it contain?"

---

AI was used as a learning aid and implementation assistant while I designed and built the system architecture and integrated the components.
