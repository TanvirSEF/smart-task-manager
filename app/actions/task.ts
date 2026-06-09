"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

// Helper to check authentication and return userId
async function getUserId() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  return userId;
}

export async function getTasks(filters?: { status?: string; priority?: string; category?: string }) {
  const userId = await getUserId();
  
  const where: any = { userId };
  if (filters?.status) where.status = filters.status;
  if (filters?.priority) where.priority = filters.priority;
  if (filters?.category) where.category = filters.category;

  return prisma.task.findMany({
    where,
    include: {
      subtasks: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function createTask(data: {
  title: string;
  description?: string;
  dueDate?: string;
  priority?: string;
  category?: string;
}) {
  const userId = await getUserId();

  const task = await prisma.task.create({
    data: {
      userId,
      title: data.title,
      description: data.description,
      dueDate: data.dueDate,
      priority: data.priority || "Medium",
      category: data.category || "Personal",
      status: "TODO",
    },
  });

  revalidatePath("/");
  return task;
}

export async function updateTask(
  id: string,
  data: {
    title?: string;
    description?: string;
    dueDate?: string;
    priority?: string;
    category?: string;
    status?: string;
  }
) {
  const userId = await getUserId();

  // Ensure user owns the task
  const existing = await prisma.task.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    throw new Error("Task not found or unauthorized");
  }

  const updated = await prisma.task.update({
    where: { id },
    data,
  });

  revalidatePath("/");
  return updated;
}

export async function deleteTask(id: string) {
  const userId = await getUserId();

  // Ensure user owns the task
  const existing = await prisma.task.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    throw new Error("Task not found or unauthorized");
  }

  await prisma.task.delete({
    where: { id },
  });

  revalidatePath("/");
  return { success: true };
}

export async function toggleSubtask(id: string, completed: boolean) {
  const userId = await getUserId();

  const subtask = await prisma.subtask.findUnique({
    where: { id },
    include: { task: true },
  });

  if (!subtask || subtask.task.userId !== userId) {
    throw new Error("Unauthorized or Subtask not found");
  }

  const updated = await prisma.subtask.update({
    where: { id },
    data: { completed },
  });

  revalidatePath("/");
  return updated;
}

export async function createSubtask(taskId: string, title: string) {
  const userId = await getUserId();

  const task = await prisma.task.findFirst({
    where: { id: taskId, userId },
  });

  if (!task) {
    throw new Error("Unauthorized or Task not found");
  }

  const subtask = await prisma.subtask.create({
    data: {
      taskId,
      title,
      completed: false,
    },
  });

  revalidatePath("/");
  return subtask;
}

export async function deleteSubtask(id: string) {
  const userId = await getUserId();

  const subtask = await prisma.subtask.findUnique({
    where: { id },
    include: { task: true },
  });

  if (!subtask || subtask.task.userId !== userId) {
    throw new Error("Unauthorized or Subtask not found");
  }

  await prisma.subtask.delete({
    where: { id },
  });

  revalidatePath("/");
  return { success: true };
}

export async function getAiInsights() {
  const userId = await getUserId();

  const tasks = await prisma.task.findMany({
    where: { userId },
    include: { subtasks: true },
  });

  if (tasks.length === 0) {
    return {
      point1: "<strong>Create Tasks:</strong> Add some tasks first so your AI Coach can analyze your workflow and give advice.",
      point2: "<strong>Use Categories:</strong> Set categories for your tasks to keep them organized from day one.",
    };
  }

  const tasksSummary = tasks.map(t => ({
    title: t.title,
    status: t.status,
    priority: t.priority,
    category: t.category,
    subtasksCount: t.subtasks.length,
    completedSubtasksCount: t.subtasks.filter(s => s.completed).length,
  }));

  const prompt = `Here is a list of my current tasks in my task manager:
${JSON.stringify(tasksSummary, null, 2)}

Please provide two short, actionable bullet points of productivity advice or insights based on my task list (e.g., advising on priority handling, task overload, or subtask usage). Keep each point under 2 sentences. Format your output as a JSON object with two fields:
- "point1": string (HTML bold allowed for headers, e.g. "<strong>Focus on High Priority:</strong> ...")
- "point2": string (HTML bold allowed, e.g. "<strong>Subtask Checklist:</strong> ...")`;

  try {
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
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error("OpenAI error");
    }

    const data = await response.json();
    const result = JSON.parse(data.choices?.[0]?.message?.content || "{}");
    return result;
  } catch (err) {
    console.error("Failed to generate AI insights", err);
    return {
      point1: "<strong>Focus on High Priority:</strong> Address your pending High priority tasks first to maintain momentum.",
      point2: "<strong>Break down tasks:</strong> Add subtasks to your complex tasks to make them easier to complete.",
    };
  }
}
