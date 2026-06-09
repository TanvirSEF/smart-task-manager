"use server";

import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
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

// Map MongoDB Task document to application interface
function mapTask(task: any) {
  return {
    id: task._id.toString(),
    userId: task.userId,
    title: task.title,
    description: task.description || null,
    dueDate: task.dueDate || null,
    priority: task.priority,
    status: task.status,
    category: task.category,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    subtasks: (task.subtasks || [])
      .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .map((s: any) => ({
        id: s.id,
        title: s.title,
        completed: s.completed,
        taskId: task._id.toString(),
      })),
  };
}

export async function getTasks(filters?: { status?: string; priority?: string; category?: string }) {
  const userId = await getUserId();
  const { db } = await connectToDatabase();

  const query: any = { userId };
  if (filters?.status) query.status = filters.status;
  if (filters?.priority) query.priority = filters.priority;
  if (filters?.category) query.category = filters.category;

  const tasks = await db
    .collection("tasks")
    .find(query)
    .sort({ createdAt: -1 })
    .toArray();

  return tasks.map(mapTask);
}

export async function createTask(data: {
  title: string;
  description?: string;
  dueDate?: string;
  priority?: string;
  category?: string;
}) {
  const userId = await getUserId();
  const { db } = await connectToDatabase();

  const doc = {
    userId,
    title: data.title,
    description: data.description || null,
    dueDate: data.dueDate || null,
    priority: data.priority || "Medium",
    category: data.category || "Personal",
    status: "TODO",
    createdAt: new Date(),
    updatedAt: new Date(),
    subtasks: [],
  };

  const result = await db.collection("tasks").insertOne(doc);
  revalidatePath("/");

  return {
    ...doc,
    id: result.insertedId.toString(),
  };
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
  const { db } = await connectToDatabase();

  let objectId: ObjectId;
  try {
    objectId = new ObjectId(id);
  } catch {
    throw new Error("Invalid task ID");
  }

  // Ensure user owns the task
  const existing = await db.collection("tasks").findOne({ _id: objectId, userId });
  if (!existing) {
    throw new Error("Task not found or unauthorized");
  }

  const updateFields: any = {
    ...data,
    updatedAt: new Date(),
  };

  await db.collection("tasks").updateOne({ _id: objectId }, { $set: updateFields });

  const updatedDoc = await db.collection("tasks").findOne({ _id: objectId });
  revalidatePath("/");
  return updatedDoc ? mapTask(updatedDoc) : null;
}

export async function deleteTask(id: string) {
  const userId = await getUserId();
  const { db } = await connectToDatabase();

  let objectId: ObjectId;
  try {
    objectId = new ObjectId(id);
  } catch {
    throw new Error("Invalid task ID");
  }

  // Ensure user owns the task
  const existing = await db.collection("tasks").findOne({ _id: objectId, userId });
  if (!existing) {
    throw new Error("Task not found or unauthorized");
  }

  await db.collection("tasks").deleteOne({ _id: objectId });
  revalidatePath("/");
  return { success: true };
}

export async function toggleSubtask(id: string, completed: boolean) {
  const userId = await getUserId();
  const { db } = await connectToDatabase();

  // Find the task containing the subtask with ID `id` and owned by `userId`
  const task = await db.collection("tasks").findOne({
    "subtasks.id": id,
    userId,
  });

  if (!task) {
    throw new Error("Unauthorized or Subtask not found");
  }

  // Update the subtask completeness status
  await db.collection("tasks").updateOne(
    { _id: task._id, "subtasks.id": id },
    {
      $set: {
        "subtasks.$.completed": completed,
        updatedAt: new Date(),
      },
    }
  );

  revalidatePath("/");

  // Find the subtask to return it
  const updatedTask = await db.collection("tasks").findOne({ _id: task._id });
  const subtask = updatedTask?.subtasks?.find((s: any) => s.id === id);

  if (!subtask) {
    throw new Error("Subtask not found after update");
  }

  return {
    id: subtask.id,
    title: subtask.title,
    completed: subtask.completed,
    taskId: task._id.toString(),
  };
}

export async function createSubtask(taskId: string, title: string) {
  const userId = await getUserId();
  const { db } = await connectToDatabase();

  let objectId: ObjectId;
  try {
    objectId = new ObjectId(taskId);
  } catch {
    throw new Error("Invalid task ID");
  }

  const task = await db.collection("tasks").findOne({ _id: objectId, userId });
  if (!task) {
    throw new Error("Unauthorized or Task not found");
  }

  const subtaskId = new ObjectId().toString();
  const subtask = {
    id: subtaskId,
    title,
    completed: false,
    createdAt: new Date(),
  };

  await db.collection("tasks").updateOne(
    { _id: objectId },
    {
      $push: { subtasks: subtask } as any,
      $set: { updatedAt: new Date() },
    }
  );

  revalidatePath("/");

  return {
    id: subtask.id,
    title: subtask.title,
    completed: subtask.completed,
    taskId: taskId,
  };
}

export async function deleteSubtask(id: string) {
  const userId = await getUserId();
  const { db } = await connectToDatabase();

  const task = await db.collection("tasks").findOne({
    "subtasks.id": id,
    userId,
  });

  if (!task) {
    throw new Error("Unauthorized or Subtask not found");
  }

  await db.collection("tasks").updateOne(
    { _id: task._id },
    {
      $pull: { subtasks: { id } } as any,
      $set: { updatedAt: new Date() },
    }
  );

  revalidatePath("/");
  return { success: true };
}

export async function getAiInsights() {
  const userId = await getUserId();
  const { db } = await connectToDatabase();

  const tasks = await db.collection("tasks").find({ userId }).toArray();

  if (tasks.length === 0) {
    return {
      point1: "<strong>Create Tasks:</strong> Add some tasks first so your AI Coach can analyze your workflow and give advice.",
      point2: "<strong>Use Categories:</strong> Set categories for your tasks to keep them organized from day one.",
    };
  }

  const tasksSummary = tasks.map((t: any) => ({
    title: t.title,
    status: t.status,
    priority: t.priority,
    category: t.category,
    subtasksCount: (t.subtasks || []).length,
    completedSubtasksCount: (t.subtasks || []).filter((s: any) => s.completed).length,
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
