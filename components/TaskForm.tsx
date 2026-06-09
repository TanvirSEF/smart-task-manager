"use client";

import React, { useState } from "react";

interface TaskFormData {
  title: string;
  description: string;
  dueDate: string;
  priority: string;
  category: string;
}

interface Props {
  onSubmit: (data: TaskFormData) => void;
  initialData?: {
    title: string;
    description: string | null;
    dueDate: string | null;
    priority: string;
    category: string;
  };
}

export default function TaskForm({ onSubmit, initialData }: Props) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [dueDate, setDueDate] = useState(initialData?.dueDate || "");
  const [priority, setPriority] = useState(initialData?.priority || "Medium");
  const [category, setCategory] = useState(initialData?.category || "Personal");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      dueDate,
      priority,
      category,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs text-slate-500 font-semibold mb-1.5 uppercase tracking-wide">
          Title
        </label>
        <input
          type="text"
          placeholder="Task title..."
          className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-sm focus:outline-none focus:border-purple-500/50 transition-colors text-slate-100"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-xs text-slate-500 font-semibold mb-1.5 uppercase tracking-wide">
          Description
        </label>
        <textarea
          placeholder="Optional task details..."
          rows={3}
          className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-sm focus:outline-none focus:border-purple-500/50 transition-colors text-slate-100 placeholder:text-slate-700"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs text-slate-500 font-semibold mb-1.5 uppercase tracking-wide">
            Priority
          </label>
          <select
            className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-sm focus:outline-none focus:border-purple-500/50 transition-colors text-slate-300"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-slate-500 font-semibold mb-1.5 uppercase tracking-wide">
            Category
          </label>
          <select
            className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-sm focus:outline-none focus:border-purple-500/50 transition-colors text-slate-300"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="Personal">Personal</option>
            <option value="Work">Work</option>
            <option value="Health">Health</option>
            <option value="Shopping">Shopping</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-slate-500 font-semibold mb-1.5 uppercase tracking-wide">
            Due Date
          </label>
          <input
            type="date"
            className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-sm focus:outline-none focus:border-purple-500/50 transition-colors text-slate-300"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <button
          type="submit"
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          {initialData ? "Save Changes" : "Create Task"}
        </button>
      </div>
    </form>
  );
}