"use client";

import { useState } from "react";
import { Task } from "@/types/task";

interface Props {
  onSubmit: (task: Task) => void;
  initialData?: Task;
}

export default function TaskForm({ onSubmit, initialData }: Props) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [dueDate, setDueDate] = useState(initialData?.dueDate || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTask: Task = {
      id: initialData?.id || crypto.randomUUID(),
      title,
      description,
      dueDate,
      status: initialData?.status || "pending",
    };
    onSubmit(newTask);
    if (!initialData) {
      setTitle("");
      setDescription("");
      setDueDate("");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-xl shadow-md border border-gray-200 space-y-4"
    >
      <input
        type="text"
        placeholder="Title"
        className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <textarea
        placeholder="Description"
        className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <input
        type="date"
        className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        required
      />
      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
      >
        {initialData ? "Update Task" : "Add Task"}
      </button>
    </form>
  );
}