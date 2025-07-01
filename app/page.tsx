"use client";

import TaskForm from "@/components/TaskForm";
import TaskItem from "@/components/TaskItem";
import { Task } from "@/types/task";
import { useState } from "react";

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const handleSave = (task: Task) => {
    setTasks((prev) => {
      const exists = prev.find((t) => t.id === task.id);
      if (exists) {
        return prev.map((t) => (t.id === task.id ? task : t));
      }
      return [...prev, task];
    });
    setEditingTask(null);
  };

  const handleDelete = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
  };

  return (
    <main className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center text-gray-800">
          📝 Smart Task Manager
        </h1>
        <TaskForm onSubmit={handleSave} initialData={editingTask || undefined} />
        <div className="space-y-4">
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
        </div>
      </div>
    </main>
  );
}
