import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();

    // Check if API key is configured
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'GROQ_API_KEY environment variable is not set' },
        { status: 500 }
      );
    }

    // Extract the messages array from the incoming request
    const userMessage = body.messages?.find(m => m.role === 'user');

    if (!userMessage || !userMessage.content) {
      return NextResponse.json(
        { error: 'Malformed request: missing user message or content' },
        { status: 400 }
      );
    }

    // Map Anthropic's message format to Groq's OpenAI-compatible vision format
    const groqContent = userMessage.content.map(part => {
      if (part.type === 'text') {
        return { type: 'text', text: part.text };
      } else if (part.type === 'image') {
        // Groq expects image_url with base64 data
        return {
          type: 'image_url',
          image_url: {
            url: `data:${part.source.media_type};base64,${part.source.data}`
          }
        };
      }
      return part;
    });

    const groqMessages = [
      {
        role: "system",
        content: body.system || ""
      },
      {
        role: "user",
        content: groqContent
      }
    ];

    console.log("Calling Groq API...");
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: groqMessages,
        max_completion_tokens: body.max_tokens || 1000,
        temperature: 0.7,
        response_format: { type: "json_object" } // Force JSON output
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Groq Error:", data);
      return NextResponse.json({ error: data.error?.message || 'Failed to fetch from Groq' }, { status: response.status });
    }

    // Map Groq's response back to the format the frontend expects (similar to Anthropic's response structure)
    // The frontend looks for: data.content?.find((b) => b.type === "text")?.text
    const generatedText = data.choices?.[0]?.message?.content || "";

    return NextResponse.json({
      content: [
        {
          type: "text",
          text: generatedText
        }
      ]
    });

  } catch (error) {
    console.error("API proxy error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
