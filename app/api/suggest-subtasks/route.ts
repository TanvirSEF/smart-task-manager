// app/api/suggest-subtasks/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { title, description } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key is not configured." },
        { status: 500 }
      );
    }

    const prompt = `Based on the task title "${title}" and description "${description}", suggest 3 to 5 small, actionable subtasks. Return the response as a single string, with each subtask separated by a comma. Example: Book venue,Send invitations,Order cake`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API response error:", errorText);
      return NextResponse.json(
        { error: "Failed to generate subtasks from OpenAI." },
        { status: response.status }
      );
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "";
    const subtasks = text.split(',').map((subtask: string) => subtask.trim()).filter(Boolean);

    return NextResponse.json({ subtasks });

  } catch (error) {
    console.error("OpenAI Route error:", error);
    return NextResponse.json(
      { error: "Failed to generate subtasks." },
      { status: 500 }
    );
  }
}