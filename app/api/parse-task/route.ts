import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key is not configured." },
        { status: 500 }
      );
    }

    const today = "2026-06-09";

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `You are an AI assistant that parses natural language task inputs into structured JSON.
Given a user sentence, extract the task properties:
- title: string (Mandatory, clean title)
- description: string (Optional task details extracted, default to "")
- dueDate: string (Optional, date in YYYY-MM-DD format. Calculate relative dates using today's date: ${today})
- priority: string ("High", "Medium", "Low" - default to "Medium" if not specified)
- category: string ("Work", "Personal", "Health", "Shopping" - choose best fit, default to "Personal")
- subtasks: array of strings (Optional, suggest 3 to 5 small, actionable, specific subtasks for this task)

Respond ONLY with a valid JSON object matching this schema.`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API response error:", errorText);
      return NextResponse.json(
        { error: "Failed to connect to OpenAI." },
        { status: response.status }
      );
    }

    const data = await response.json();
    const parsedTask = JSON.parse(data.choices?.[0]?.message?.content || "{}");

    return NextResponse.json({ task: parsedTask });

  } catch (error) {
    console.error("Parse Task API Error:", error);
    return NextResponse.json(
      { error: "Failed to parse task." },
      { status: 500 }
    );
  }
}
