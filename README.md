# cf_ai_brainspinoff

An AI-powered conversational assistant built on **Cloudflare Workers AI** with **Durable Objects–based memory** and a **Cloudflare Pages frontend**.

I made this project as a part of the Cloudflare AI app assignment to demonstrate end-to-end AI application development using Cloudflare-native infrastructure.



Deployed Link: https://cf-ai-brainspinoff.pages.dev/

---

## Overview

`cf_ai_brainspinoff` does the following:

- Uses **Llama 3.3 via Workers AI** for natural language responses
- Maintains **persistent per-user conversation memory** using Durable Objects (DO)
- Provides a **browser-based chat interface** hosted on Cloudflare Pages
- Handles **CORS, routing, and session coordination** through a Cloudflare Worker

This project also allowes conversations to maintain context accross messaage within a session

---

## Features

### LLM Integration
- Model: `@cf/meta/llama-3.3-70b-instruct-fp8-fast`
- Runs directly on **Cloudflare Workers AI**
- Uses system + recent conversation history to produce context-aware replies

### Persistent Memory (Durable Objects)
- Each chat session is tied to a **Durable Object instance**
- Stores conversation history in `state.storage`
- Provides per-user conversational continuity

### Workflow / Coordination
- Cloudflare Worker acts as an API layer
- Routes `/chat` requests to a session-specific Durable Object
- Durable Object manages state + AI calls

### User Interface
- Frontend hosted on **Cloudflare Pages**
- Sends chat messages to Worker API
- Displays assistant responses in real time

### CORS Handling
- Implemented custom CORS logic to safely allow browser → Worker communication
- Proper handling of:
  - `Origin`
  - Preflight `OPTIONS` requests
  - `Access-Control-Allow-*` headers

---

## Architecture

Browser (Pages) --> Cloudflare Worker (API Layer) --> Durable Object (ChatSession) --> Workers AI (Llama 3.3)

**Flow:**
1. User sends a message from the browser UI.
2. Request goes to the Worker `/chat` endpoint.
3. Worker forwards the request to a Durable Object instance based on `chatId`.
4. Durable Object:
   - Loads previous conversation history
   - Appends the new user message
   - Calls Workers AI with recent context
   - Stores the updated history
5. AI response is returned to the UI.


---

## Files

| File | Purpose |
|------|--------|
| `src/worker/index.js` | Worker API + Durable Object class |
| `src/pages/script.js` | Frontend chat logic |
| `wrangler.jsonc` | Worker config + Durable Object binding |
| `PROMPTS.md` | AI prompts used during development |


---


## What This Project Demonstrates

It was a rapid learning exercise!


While building, I :
1. Learned JavaScript (from nothing) specifically for Cloudflare Workers
2. Learned how CORS policy works in practice
3. Implemented Durable Objects from scratch
4. Understood Cloudflare’s edge-native AI execution model

All of this was built in a few hours, demonstrating my ability to:
1. Quickly learn new languages and platform
2. Translate architectural designs to working pipelines
3. Combine front end and backend systems

It builds on my existing knowledge in:
1. LLMs
2. GenAI
3. AI Application design


If I had more time, I would incorporate:
1. RAG pipelines, making use of the file system I had installed in the right panel
  - The user would drag and drop the upload the file and that would go into the file system
  - Once there, the user could click on it, and any chats that had accessed that document in the past would be able show up on the left panel under "Relevant Chats"
2. Streaming AI responses
3. Multi-session management
4. Message deletion


---

# Additional Notes
I'm actually building this application from the ground up as my current personal project. I'm working alongside two other friends, where we own different aspects of it.


I'm responsible for architecting the entire project, building the api, managing the system design, setting up proper database designs and relations, and connecting the frontend to backend. 


I'm acting as a "pseudo leader", allocating different work to ensure proper communications between us friends!


There's more about this project and how I set everything up here :D

https://github.com/pycoder49/adaptive-second-brain

It's called "Adaptive Second Brain"!