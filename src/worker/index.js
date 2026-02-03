function corsHeaders() {
	return {
		"Access-Control-Allow-Origin": origin ?? "*",
		"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
		"Access-Control-Allow-Headers": "Content-Type",
	}
}

function withCors(response, origin) {
	const newHeaders = new Headers(response.headers);
	const cors = corsHeaders(origin);
	for(const [key, value] of Object.entries(cors)){
		newHeaders.set(key, value);
	}
	return new Response(response.body, {
		status: response.status,
		headers: newHeaders
	})
}

export default{
	async fetch(request, env){
		const origin = request.headers.get("Origin");

		// Handle CORS preflight request
		if(request.method === "OPTIONS"){
			return new Response(null, {status: 204, headers: corsHeaders(origin)});
		}

		try{
			const url = new URL(request.url);

			// health check endpoint
			if(url.pathname === "/health"){
				return new Response("OK", {status: 200, headers: corsHeaders(origin)});
			}

			// chat endpoint
			if(url.pathname === "/chat" && request.method === "POST"){
				let body

				try{
					body = await request.json();
				}
				catch(e){
					return new Response(JSON.stringify({ error: "Invalid JSON" }), {
						status: 400,
						headers: {
							...corsHeaders(origin),
							"Content-Type": "application/json"
						}
					})
				}

				const userMessage = body.message;
				if(!userMessage){
					return new Response(JSON.stringify({ error: "Missing 'message' in request body" }), {
						status: 400,
						headers: {
							...corsHeaders(origin),
							"Content-Type": "application/json"
						}
					})
				}

				// calling the worker AI binding to get a response from llama
				const aiResponse = await env.AI.run("@cf/meta/llama-3.3-70b-instruct", {
					messages: [
						{ role: "system", content: "You are a helpful assistant." },
						{ role: "user", content: userMessage },
					],
				});

				// output inside aiResponse.response
				return new Response(
					JSON.stringify({
						response: aiResponse.response,
						timestamp: Date.now()
					}), {
					status: 200,
					headers: {
						...corsHeaders(origin),
						"Content-Type": "application/json"
					}
				})
			}

			// If no matching route found
			return new Response("Not Found", {status: 404, headers: corsHeaders()});
		}
		catch(e){
			return new Response(JSON.stringify({errpr: e.message ?? "Server error"}), {
				status: 500,
				headers: {
					...corsHeaders(origin),
					"Content-Type": "application/json"
				}
			});
		}
	}
};