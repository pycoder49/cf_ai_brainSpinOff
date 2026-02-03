export class ChatSession {
	constructor(state, env){
		this.state = state;
		this.env = env;
	}

	corsHeaders(origin) {
		const allowed = new Set([
		"https://cf-ai-brainspinoff.pages.dev",
		"http://localhost:8788",
		"http://127.0.0.1:8788",
		]);

		const allowOrigin = allowed.has(origin) ? origin : "https://cf-ai-brainspinoff.pages.dev";

		return {
		"Access-Control-Allow-Origin": allowOrigin,
		"Access-Control-Allow-Methods": "GET,POST,OPTIONS",
		"Access-Control-Allow-Headers": "Content-Type",
		"Access-Control-Max-Age": "86400",
		"Vary": "Origin",
		};
	}

	async fetch(request){
		const origin = request.headers.get("Origin") || "";
		const corsHeaders = this.corsHeaders(origin);

		// handling CORS preflight request
		if(request.method === "OPTIONS"){
			return new Response(null, {
				status: 204,
				headers: corsHeaders
			})
		}

		// after options, handle the actual request
		let body;
		try{
			body = await request.json();
		}
		catch(e){
			return Response.json({ error: "Invalid JSON" }, {
				status: 400,
				headers: corsHeaders
			});
		}

		// process the chat message
		const userMessage = body.message;
		if(!userMessage){
			return Response.json({ error: "Missing 'message' in request body" }, {
				status: 400,
				headers: corsHeaders
			});
		}

		// getting the history from state
		const history = (
			await this.state.get("history")
		) || [];

		// getting the last 10 messages for context
		const recentHistory = history.slice(-10);

		// getting the ai llama response
		const aiResponse = await this.env.AI.run(
			"@cf/meta/llama-3.3-70b-instruct-fp8-fast",
			{
				messages: [
					{ role: "system", content: "You are a helpful assistant." },
					...recentHistory,	// this practically unpacks it in python terms
				]
			}
		);

		// updating the history with new messages
		const botResponse = aiResponse.response ?? "(no resposne)";
		history.push({
			role: "assistant",
			content: botResponse
		})

		// saving it to session state
		await this.state.put("history", history);

		// return the ai response
		return Response.json(
			{ response: botResponse, timestamp: Date.now() },
			{ headers: corsHeaders }
		);
	}
}

export default {
	async fetch(request, env){
		const url = new URL(request.url);

		if(url.pathname === "/chat" && request.method === "POST"){
			let body;
			try{
				body = await request.json();
			}
			catch(e){
				return Response.json({ error: "Invalid JSON" }, { status: 400 });
			}

			// we need the chat id
			const chatId = body.chatId || "default";

			// recreating request since we just read the body
			const newRequest = new Request("https://do/chat", {
				method: "POST",
				headers: request.headers,
				body: JSON.stringify(body),
			});

			const id = env.CHAT_HISTORY_STORE.idFromName(chatId);
			const stub = env.CHAT_HISTORY_STORE.get(id);

			return stub.fetch(newRequest);
		}

		return Response.json({ message: "CF-AI Brain Spin-off Worker is running." });
	}
}