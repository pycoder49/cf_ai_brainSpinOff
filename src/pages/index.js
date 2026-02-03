function corsHeaders() {
	return {
		"Access-Control-Allow-Origin": "*",
		"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
		"Access-Control-Allow-Headers": "Content-Type",
	}
}

export default{
	async fetch(request, env){
		const url = new URL(request.url);

		// Handle CORS preflight request
		if(request.method === "OPTIONS"){
			return new Response(null, {headers: corsHeaders()});
		}

		// health check endpoint
		if(url.pathname === "/health"){
			return new Response("OK", {status: 200, headers: corsHeaders()});
		}

		// echo endpoint
		if(url.pathname === "/echo" && request.method === "POST"){
			const body = await request.json();
			return Response.json(
				{
					you_sent: body,
					timestamp: Date.now()
				},
				{
					headers: corsHeaders()
				}
			);
		}

		// chat endpoint
		if(url.pathname === "/chat" && request.method === "POST"){
			let body

			try{
				body = await request.json();
			}
			catch(e){
				return Response.json(
					{ error: "Invalid JSON" },
					{ status: 400, headers: corsHeaders() }
				);
			}

			const userMessage = body.message;
			if(!userMessage){
				return Response.json(
					{ error: "Missing 'message' field in request body" },
					{ status: 400, headers: corsHeaders() }
				);
			}

			// calling the worker AI binding to get a response from llama
			const aiResponse = await env.AI.run("@cf/meta/llama-3.3-70b-instruct", {
				messages: [
					{ 
						role: "system",
						content: "You are a helpful assistant"
					},
					{
						role: "user",
						content: userMessage
					}
				]
			});

			// output inside aiResponse.response
			return Response.json(
				{ response: aiResponse.response, timestamp: Date.now() },
				{ headers: corsHeaders() }
			);
		}

		return new Response("Not Found", {status: 404, headers: corsHeaders()});
	}
};