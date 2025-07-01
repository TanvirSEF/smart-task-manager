"use client";

import { Task } from "@/types/task";
import { useState } from "react";

interface Props {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export default function TaskItem({ task, onEdit, onDelete }: Props) {
  const [loading, setLoading] = useState(false);
  const [subtasks, setSubtasks] = useState<string[]>([]);

  const suggestSubtasks = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/suggest-subtasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: task.title, description: task.description }),
      });
      const data = await res.json();
      setSubtasks(data.subtasks || []);
    } catch (err) {
      alert("Error fetching subtasks");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl bg-white p-5 shadow-md space-y-3 border border-gray-200">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-bold text-gray-800">{task.title}</h3>
          <p className="text-sm text-gray-600">{task.description}</p>
          <p className="text-xs text-gray-500">Due: {task.dueDate}</p>
          <span
            className={`inline-block mt-1 px-2 py-1 text-xs rounded ${
              task.status === "completed"
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {task.status}
          </span>
        </div>
        <div className="space-x-2">
          <button onClick={() => onEdit(task)} className="text-sm text-blue-600 hover:underline">
            Edit
          </button>
          <button onClick={() => onDelete(task.id)} className="text-sm text-red-600 hover:underline">
            Delete
          </button>
        </div>
      </div>
      <button
        onClick={suggestSubtasks}
        disabled={loading}
        className="text-sm bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded disabled:opacity-50"
      >
        {loading ? "Suggesting..." : "Suggest Subtasks"}
      </button>

      {subtasks.length > 0 && (
        <ul className="list-disc pl-6 text-sm text-gray-700">
          {subtasks.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      )}
    </div>
  );
}