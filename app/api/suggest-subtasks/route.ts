// app/api/suggest-subtasks/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { title, description } = await req.json();

    // A clear and concise prompt for the AI
    const prompt = `Based on the task title "${title}" and description "${description}", suggest 3 to 5 small, actionable subtasks. Return the response as a single string, with each subtask separated by a comma. Example: Book venue,Send invitations,Order cake`;
    // 1. MODEL SELECTION: Use the appropriate model for generating content
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 2. SIMPLIFICATION: Pass the prompt string directly
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const subtasks = text.split(',').map(subtask => subtask.trim());

    return NextResponse.json({ subtasks });

  } catch (error) {
    console.error("Gemini API error:", error);
    return NextResponse.json(
      { error: "Failed to generate subtasks." },
      { status: 500 }
    );
  }
}