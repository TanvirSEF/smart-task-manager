"use client";

import React, { useState, useEffect, startTransition } from "react";
import { UserButton, useUser, useClerk } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Sparkles,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  Trash2,
  Edit2,
  TrendingUp,
  BrainCircuit,
  MessageSquare,
  Activity,
  User,
  LogOut,
} from "lucide-react";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  createSubtask,
  toggleSubtask,
  deleteSubtask,
  getAiInsights,
} from "@/app/actions/task";
import TaskForm from "./TaskForm";

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  taskId: string;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  priority: string;
  status: string;
  category: string;
  createdAt: Date;
  subtasks: Subtask[];
}

export default function Dashboard() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState<"kanban" | "list" | "analytics">("kanban");
  
  // Modals & Forms
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  // AI States
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  // Subtask UI States
  const [newSubtaskTexts, setNewSubtaskTexts] = useState<{ [taskId: string]: string }>({});
  const [loadingSubtaskTaskId, setLoadingSubtaskTaskId] = useState<string | null>(null);

  // AI Coach Insights States
  const [aiCoachInsights, setAiCoachInsights] = useState<{ point1: string; point2: string } | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const filters: any = {};
        if (statusFilter !== "ALL") filters.status = statusFilter;
        if (priorityFilter !== "ALL") filters.priority = priorityFilter;
        if (categoryFilter !== "ALL") filters.category = categoryFilter;

        const dbTasks = await getTasks(filters);
        if (active) {
          setTasks(dbTasks as unknown as Task[]);
        }
      } catch (err) {
        console.error("Failed to load tasks", err);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [statusFilter, priorityFilter, categoryFilter, refreshTrigger]);

  useEffect(() => {
    if (viewMode === "analytics") {
      let active = true;
      const loadInsights = async () => {
        setLoadingInsights(true);
        try {
          const res = await getAiInsights();
          if (active) {
            setAiCoachInsights(res);
          }
        } catch (err) {
          console.error(err);
        } finally {
          if (active) {
            setLoadingInsights(false);
          }
        }
      };
      loadInsights();
      return () => {
        active = false;
      };
    }
  }, [viewMode, tasks]);

  // Handle Task Action Completion
  const refreshTasks = () => {
    startTransition(() => {
      setRefreshTrigger(prev => prev + 1);
    });
  };

  // AI Natural Language Quick Add Handler
  const handleAiQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setAiLoading(true);
    setAiError("");
    try {
      const res = await fetch("/api/parse-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt }),
      });

      if (!res.ok) {
        let errorMsg = "Failed to parse task via AI.";
        try {
          const data = await res.json();
          errorMsg = data.error || errorMsg;
        } catch {
          errorMsg = `Server error (${res.status}): Please check OpenAI API Key in Vercel settings.`;
        }
        setAiError(errorMsg);
        return;
      }

      const data = await res.json();
      if (data.task) {
        const newTask = await createTask({
          title: data.task.title,
          description: data.task.description,
          dueDate: data.task.dueDate,
          priority: data.task.priority,
          category: data.task.category,
        });

        if (newTask && data.task.subtasks && Array.isArray(data.task.subtasks)) {
          for (const subtaskTitle of data.task.subtasks) {
            await createSubtask(newTask.id, subtaskTitle);
          }
        }

        setAiPrompt("");
        refreshTasks();
      } else {
        setAiError("No task data returned from AI.");
      }
    } catch (err: any) {
      setAiError(`Network error: ${err?.message || "Please try again."}`);
    } finally {
      setAiLoading(false);
    }
  };

  // Task Card Status Toggler
  const handleMoveStatus = async (taskId: string, currentStatus: string) => {
    const statuses = ["TODO", "IN_PROGRESS", "COMPLETED"];
    const currentIndex = statuses.indexOf(currentStatus);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
    
    await updateTask(taskId, { status: nextStatus });
    refreshTasks();
  };

  // Delete Task Handler
  const handleDeleteTask = async (taskId: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      await deleteTask(taskId);
      refreshTasks();
    }
  };

  // Add Subtask Handler
  const handleAddSubtask = async (taskId: string) => {
    const text = newSubtaskTexts[taskId]?.trim();
    if (!text) return;

    setLoadingSubtaskTaskId(taskId);
    try {
      await createSubtask(taskId, text);
      setNewSubtaskTexts(prev => ({ ...prev, [taskId]: "" }));
      refreshTasks();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSubtaskTaskId(null);
    }
  };

  // Toggle Subtask Completion Handler
  const handleToggleSubtask = async (subtaskId: string, completed: boolean) => {
    await toggleSubtask(subtaskId, completed);
    refreshTasks();
  };

  // Delete Subtask Handler
  const handleDeleteSubtask = async (subtaskId: string) => {
    await deleteSubtask(subtaskId);
    refreshTasks();
  };

  // AI Subtasks Suggestion (Direct inside task card)
  const [suggestingTaskId, setSuggestingTaskId] = useState<string | null>(null);
  const handleSuggestSubtasks = async (task: Task) => {
    setSuggestingTaskId(task.id);
    try {
      const res = await fetch("/api/suggest-subtasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: task.title, description: task.description || "" }),
      });

      if (!res.ok) {
        let errorMsg = "Failed to suggest subtasks.";
        try {
          const data = await res.json();
          errorMsg = data.error || errorMsg;
        } catch {
          errorMsg = `Server error (${res.status}).`;
        }
        alert(errorMsg);
        return;
      }

      const data = await res.json();
      if (data.subtasks) {
        // Create all suggested subtasks in the database
        for (const subtaskTitle of data.subtasks) {
          await createSubtask(task.id, subtaskTitle);
        }
        refreshTasks();
      }
    } catch (err: any) {
      alert(`Error generating subtasks: ${err?.message || "Please check network."}`);
    } finally {
      setSuggestingTaskId(null);
    }
  };

  // Filter Tasks via Search
  const filteredTasks = tasks.filter(task => {
    const matchesSearch =
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(search.toLowerCase()));
    return matchesSearch;
  });

  // Stats Calculations
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === "COMPLETED").length;
  const pendingTasks = totalTasks - completedTasks;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900/40 border-b md:border-b-0 md:border-r border-slate-800/80 backdrop-blur-xl p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-8">
          {/* Logo / Brand */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gradient-to-tr from-purple-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-950/40">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-none tracking-tight">SmartTask</h1>
              <span className="text-[10px] font-semibold tracking-wider text-purple-400 uppercase">Premium AI</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-2">
            <button
              onClick={() => setViewMode("kanban")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                viewMode === "kanban"
                  ? "bg-purple-600/10 border border-purple-500/20 text-purple-300"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 border border-transparent"
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
              Kanban Board
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                viewMode === "list"
                  ? "bg-purple-600/10 border border-purple-500/20 text-purple-300"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 border border-transparent"
              }`}
            >
              <List className="h-4 w-4" />
              Detailed List
            </button>
            <button
              onClick={() => setViewMode("analytics")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                viewMode === "analytics"
                  ? "bg-purple-600/10 border border-purple-500/20 text-purple-300"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 border border-transparent"
              }`}
            >
              <Activity className="h-4 w-4" />
              AI Insights
            </button>
          </nav>
        </div>

        {/* User Profile Footer */}
        <div className="pt-6 border-t border-slate-800/60 flex items-center justify-between gap-3 mt-6 md:mt-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <UserButton />
            <div className="overflow-hidden">
              <p className="text-xs font-semibold truncate text-slate-200">
                {user?.fullName || user?.primaryEmailAddress?.emailAddress}
              </p>
              <span className="text-[10px] text-slate-500 capitalize">Personal Account</span>
            </div>
          </div>
          
          <button
            onClick={() => signOut({ redirectUrl: "/sign-in" })}
            className="p-2 bg-slate-800/60 hover:bg-rose-950/20 text-slate-400 hover:text-rose-400 border border-slate-800/80 hover:border-rose-950/30 rounded-xl transition-all cursor-pointer"
            title="Log Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto max-w-7xl mx-auto w-full">
        
        {/* Top Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Welcome back!</h2>
            <p className="text-slate-400 text-sm">Organize and accelerate your workflow with OpenAI Suggestions.</p>
          </div>
          
          <button
            onClick={() => {
              setEditingTask(null);
              setIsFormOpen(true);
            }}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-purple-950/20 hover:shadow-purple-900/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add Task
          </button>
        </header>

        {/* Stats Dashboard Widgets */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/30 border border-slate-800/50 backdrop-blur-xl p-5 rounded-2xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-slate-500 text-xs font-medium">Total Tasks</span>
              <h3 className="text-2xl font-bold">{totalTasks}</h3>
            </div>
            <div className="h-10 w-10 bg-slate-800/40 rounded-xl flex items-center justify-center border border-slate-700/30">
              <LayoutGrid className="h-5 w-5 text-indigo-400" />
            </div>
          </div>
          
          <div className="bg-slate-900/30 border border-slate-800/50 backdrop-blur-xl p-5 rounded-2xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-slate-500 text-xs font-medium">Active Tasks</span>
              <h3 className="text-2xl font-bold text-amber-400">{pendingTasks}</h3>
            </div>
            <div className="h-10 w-10 bg-slate-800/40 rounded-xl flex items-center justify-center border border-slate-700/30">
              <Clock className="h-5 w-5 text-amber-400" />
            </div>
          </div>

          <div className="bg-slate-900/30 border border-slate-800/50 backdrop-blur-xl p-5 rounded-2xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-slate-500 text-xs font-medium">Completed</span>
              <h3 className="text-2xl font-bold text-emerald-400">{completedTasks}</h3>
            </div>
            <div className="h-10 w-10 bg-slate-800/40 rounded-xl flex items-center justify-center border border-slate-700/30">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            </div>
          </div>

          <div className="bg-slate-900/30 border border-slate-800/50 backdrop-blur-xl p-5 rounded-2xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-slate-500 text-xs font-medium">Completion Rate</span>
              <h3 className="text-2xl font-bold text-purple-400">{completionRate}%</h3>
            </div>
            <div className="h-10 w-10 bg-slate-800/40 rounded-xl flex items-center justify-center border border-slate-700/30">
              <TrendingUp className="h-5 w-5 text-purple-400" />
            </div>
          </div>
        </section>

        {/* AI Quick Add Section */}
        <section className="bg-slate-900/20 border border-slate-800/60 rounded-2xl p-5 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Sparkles className="h-32 w-32 text-purple-400" />
          </div>
          
          <div className="flex items-center gap-2.5 mb-3">
            <Sparkles className="h-4 w-4 text-purple-400" />
            <h4 className="text-sm font-semibold tracking-wide text-purple-300">AI Quick Add (OpenAI Powered)</h4>
          </div>
          
          <form onSubmit={handleAiQuickAdd} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="e.g. Write design review document tomorrow morning, high priority"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              className="flex-1 bg-slate-950/80 border border-slate-800 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-purple-500/50 transition-colors placeholder:text-slate-600"
            />
            <button
              type="submit"
              disabled={aiLoading}
              className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium text-sm px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              {aiLoading ? "Parsing..." : "Parse & Create"}
            </button>
          </form>
          {aiError && <p className="text-red-400 text-xs mt-2">{aiError}</p>}
        </section>

        {/* Filter and View Toggler Bar */}
        <section className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 bg-slate-900/25 border border-slate-800/40 p-4 rounded-2xl backdrop-blur-xl">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-800/80 pl-9 pr-4 py-2 rounded-xl text-xs focus:outline-none focus:border-purple-500/50 transition-colors"
              />
            </div>
            
            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-slate-950/50 border border-slate-800/80 text-xs px-3 py-2 rounded-xl focus:outline-none text-slate-300"
            >
              <option value="ALL">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-950/50 border border-slate-800/80 text-xs px-3 py-2 rounded-xl focus:outline-none text-slate-300"
            >
              <option value="ALL">All Categories</option>
              <option value="Personal">Personal</option>
              <option value="Work">Work</option>
              <option value="Health">Health</option>
              <option value="Shopping">Shopping</option>
            </select>
          </div>
        </section>

        {/* Dynamic Views Panel */}
        <section className="relative min-h-[400px]">
          <AnimatePresence mode="wait">
            
            {/* 1. KANBAN BOARD VIEW */}
            {viewMode === "kanban" && (
              <motion.div
                key="kanban"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                {["TODO", "IN_PROGRESS", "COMPLETED"].map((columnStatus) => {
                  const columnTasks = filteredTasks.filter(t => t.status === columnStatus);
                  
                  return (
                    <div key={columnStatus} className="flex flex-col space-y-4">
                      
                      {/* Column Title Header */}
                      <div className="flex items-center justify-between border-b border-slate-800/60 pb-2 px-2">
                        <div className="flex items-center gap-2.5">
                          <span className={`h-2 w-2 rounded-full ${
                            columnStatus === "TODO" ? "bg-indigo-500" :
                            columnStatus === "IN_PROGRESS" ? "bg-amber-500" :
                            "bg-emerald-500"
                          }`} />
                          <h4 className="text-xs font-semibold tracking-wider uppercase text-slate-400">
                            {columnStatus === "IN_PROGRESS" ? "In Progress" : columnStatus}
                          </h4>
                          <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 font-bold">
                            {columnTasks.length}
                          </span>
                        </div>
                      </div>

                      {/* Column Tasks */}
                      <div className="flex flex-col gap-4 min-h-[300px]">
                        {columnTasks.map((task) => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            onEdit={() => {
                              setEditingTask(task);
                              setIsFormOpen(true);
                            }}
                            onDelete={() => handleDeleteTask(task.id)}
                            onToggleStatus={() => handleMoveStatus(task.id, task.status)}
                            onSuggestSubtasks={() => handleSuggestSubtasks(task)}
                            suggesting={suggestingTaskId === task.id}
                            newSubtaskText={newSubtaskTexts[task.id] || ""}
                            setNewSubtaskText={(txt) => setNewSubtaskTexts(prev => ({ ...prev, [task.id]: txt }))}
                            onAddSubtask={() => handleAddSubtask(task.id)}
                            loadingSubtask={loadingSubtaskTaskId === task.id}
                            onToggleSubtask={handleToggleSubtask}
                            onDeleteSubtask={handleDeleteSubtask}
                          />
                        ))}
                        {columnTasks.length === 0 && (
                          <div className="border border-dashed border-slate-800/40 rounded-2xl py-12 flex flex-col items-center justify-center text-slate-600 bg-slate-900/5">
                            <span className="text-xs">No tasks in this column</span>
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })}
              </motion.div>
            )}

            {/* 2. LIST VIEW */}
            {viewMode === "list" && (
              <motion.div
                key="list"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-slate-900/10 border border-slate-800/40 rounded-2xl backdrop-blur-xl overflow-hidden"
              >
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800/80 bg-slate-900/20 text-slate-500 text-xs font-semibold">
                      <th className="p-4">Task</th>
                      <th className="p-4">Priority</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {filteredTasks.map((task) => (
                      <tr key={task.id} className="hover:bg-slate-900/10 transition-colors text-sm">
                        <td className="p-4">
                          <div className="space-y-0.5">
                            <p className="font-semibold text-slate-200">{task.title}</p>
                            <p className="text-xs text-slate-500 truncate max-w-xs">{task.description}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 text-[10px] rounded-full border ${
                            task.priority === "High" ? "bg-red-500/10 border-red-500/20 text-red-400" :
                            task.priority === "Medium" ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                            "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
                          }`}>
                            {task.priority}
                          </span>
                        </td>
                        <td className="p-4 text-xs text-slate-400">{task.category}</td>
                        <td className="p-4">
                          <button
                            onClick={() => handleMoveStatus(task.id, task.status)}
                            className={`px-2.5 py-1 text-[10px] rounded-full border transition-all cursor-pointer ${
                              task.status === "COMPLETED" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                              task.status === "IN_PROGRESS" ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                              "bg-slate-800 border-slate-700 text-slate-400"
                            }`}
                          >
                            {task.status}
                          </button>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => {
                              setEditingTask(task);
                              setIsFormOpen(true);
                            }}
                            className="text-slate-400 hover:text-purple-400 p-1.5 rounded-lg hover:bg-slate-800/50 transition-colors inline-block"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="text-slate-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-slate-800/50 transition-colors inline-block"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredTasks.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-12 text-center text-slate-500 text-xs">
                          No tasks matching your filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </motion.div>
            )}

            {/* 3. AI ANALYTICS VIEW */}
            {viewMode === "analytics" && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {/* AI Performance Card */}
                <div className="bg-slate-900/30 border border-slate-800/50 p-6 rounded-2xl backdrop-blur-xl space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-purple-500/10 rounded-xl flex items-center justify-center border border-purple-500/20">
                      <BrainCircuit className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                      <h4 className="font-bold">AI Coach Analysis</h4>
                      <p className="text-xs text-slate-500">Real-time productivity optimization tips</p>
                    </div>
                  </div>
                  <div className="text-slate-300 text-sm leading-relaxed space-y-4">
                    {loadingInsights ? (
                      <div className="flex flex-col items-center justify-center py-6 space-y-2">
                        <div className="h-6 w-6 border-2 border-purple-500 border-t-transparent animate-spin rounded-full" />
                        <span className="text-xs text-slate-500">AI Coach is analyzing your tasks...</span>
                      </div>
                    ) : aiCoachInsights ? (
                      <>
                        <p
                          className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/60"
                          dangerouslySetInnerHTML={{ __html: `💡 ${aiCoachInsights.point1}` }}
                        />
                        <p
                          className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/60"
                          dangerouslySetInnerHTML={{ __html: `💡 ${aiCoachInsights.point2}` }}
                        />
                      </>
                    ) : (
                      <p className="text-xs text-slate-500 text-center py-6">No insights available.</p>
                    )}
                  </div>
                </div>

                {/* Categories & Priorities distribution details */}
                <div className="bg-slate-900/30 border border-slate-800/50 p-6 rounded-2xl backdrop-blur-xl flex flex-col justify-between">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20">
                      <Activity className="h-5 w-5 text-indigo-400" />
                    </div>
                    <div>
                      <h4 className="font-bold">Distribution Metrics</h4>
                      <p className="text-xs text-slate-500">Breakdown of categories and completion rate</p>
                    </div>
                  </div>
                  <div className="space-y-4 flex-1 justify-center flex flex-col">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-slate-400 font-semibold">
                        <span>Work Tasks</span>
                        <span>{tasks.filter(t => t.category === "Work").length} tasks</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-500 h-2 rounded-full"
                          style={{ width: `${tasks.length > 0 ? (tasks.filter(t => t.category === "Work").length / tasks.length) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-slate-400 font-semibold">
                        <span>Personal Tasks</span>
                        <span>{tasks.filter(t => t.category === "Personal").length} tasks</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-purple-500 h-2 rounded-full"
                          style={{ width: `${tasks.length > 0 ? (tasks.filter(t => t.category === "Personal").length / tasks.length) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-slate-400 font-semibold">
                        <span>Health & Shopping</span>
                        <span>{tasks.filter(t => t.category === "Health" || t.category === "Shopping").length} tasks</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-amber-500 h-2 rounded-full"
                          style={{ width: `${tasks.length > 0 ? (tasks.filter(t => t.category === "Health" || t.category === "Shopping").length / tasks.length) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </section>

        {/* Task Edit/Create Popup Form Modal */}
        <AnimatePresence>
          {isFormOpen && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl p-6 relative overflow-hidden"
              >
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-4">
                  <h3 className="font-bold text-lg">{editingTask ? "Update Task details" : "Create Task"}</h3>
                  <button
                    onClick={() => setIsFormOpen(false)}
                    className="text-slate-500 hover:text-slate-300 text-xs px-2 py-1 bg-slate-800/40 hover:bg-slate-800/80 rounded-lg cursor-pointer"
                  >
                    Close
                  </button>
                </div>
                
                <TaskForm
                  initialData={editingTask || undefined}
                  onSubmit={async (data) => {
                    if (editingTask) {
                      await updateTask(editingTask.id, data);
                    } else {
                      await createTask(data);
                    }
                    setIsFormOpen(false);
                    refreshTasks();
                  }}
                />
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </main>

    </div>
  );
}

// Inner Component for Task Card (Kanban layout)
interface TaskCardProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
  onSuggestSubtasks: () => void;
  suggesting: boolean;
  newSubtaskText: string;
  setNewSubtaskText: (txt: string) => void;
  onAddSubtask: () => void;
  loadingSubtask: boolean;
  onToggleSubtask: (id: string, completed: boolean) => void;
  onDeleteSubtask: (id: string) => void;
}

function TaskCard({
  task,
  onEdit,
  onDelete,
  onToggleStatus,
  onSuggestSubtasks,
  suggesting,
  newSubtaskText,
  setNewSubtaskText,
  onAddSubtask,
  loadingSubtask,
  onToggleSubtask,
  onDeleteSubtask,
}: TaskCardProps) {
  const [subtasksOpen, setSubtasksOpen] = useState(false);

  return (
    <motion.div
      layout
      className="bg-slate-900/30 border border-slate-800/60 hover:border-slate-700/60 p-5 rounded-2xl backdrop-blur-xl shadow-lg relative flex flex-col justify-between group space-y-4"
    >
      <div className="space-y-2">
        {/* Category & Actions */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-purple-400 font-semibold uppercase tracking-wider bg-purple-950/30 px-2 py-0.5 rounded">
            {task.category}
          </span>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5">
            <button
              onClick={onEdit}
              className="text-slate-500 hover:text-purple-400 p-1 hover:bg-slate-800/40 rounded transition-all cursor-pointer"
            >
              <Edit2 className="h-3 w-3" />
            </button>
            <button
              onClick={onDelete}
              className="text-slate-500 hover:text-red-400 p-1 hover:bg-slate-800/40 rounded transition-all cursor-pointer"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Title & Desc */}
        <div>
          <h5 className="font-bold text-slate-100 group-hover:text-white transition-colors leading-snug">
            {task.title}
          </h5>
          {task.description && (
            <p className="text-slate-500 text-xs mt-1.5 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}
        </div>

        {/* Due Date & Priority */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px] text-slate-400">
          {task.dueDate && (
            <div className="flex items-center gap-1 bg-slate-800/35 border border-slate-800 px-2 py-0.5 rounded">
              <Calendar className="h-3 w-3 text-slate-500" />
              <span>{task.dueDate}</span>
            </div>
          )}
          <span className={`px-2 py-0.5 rounded border ${
            task.priority === "High" ? "bg-red-500/10 border-red-500/20 text-red-400" :
            task.priority === "Medium" ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
            "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
          }`}>
            {task.priority}
          </span>
        </div>
      </div>

      {/* Subtasks dropdown toggler */}
      <div className="border-t border-slate-800/60 pt-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSubtasksOpen(!subtasksOpen)}
            className="flex items-center gap-1 text-slate-400 hover:text-slate-200 text-xs transition-colors cursor-pointer font-medium"
          >
            <ChevronRight className={`h-3 w-3 transition-transform ${subtasksOpen ? "rotate-90" : ""}`} />
            <span>Checklist ({task.subtasks.filter(s => s.completed).length}/{task.subtasks.length})</span>
          </button>
          
          <button
            onClick={onSuggestSubtasks}
            disabled={suggesting}
            className="text-[10px] bg-purple-600/10 border border-purple-500/20 hover:bg-purple-600/20 text-purple-300 font-semibold px-2 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="h-2.5 w-2.5" />
            {suggesting ? "Generating..." : "AI Suggest"}
          </button>
        </div>

        {/* Subtasks List */}
        {subtasksOpen && (
          <div className="mt-3 space-y-2 bg-slate-950/20 p-2.5 rounded-xl border border-slate-800/40">
            {task.subtasks.map((subtask) => (
              <div key={subtask.id} className="flex items-center justify-between gap-2 text-xs">
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={subtask.completed}
                    onChange={(e) => onToggleSubtask(subtask.id, e.target.checked)}
                    className="h-3.5 w-3.5 bg-slate-950 border border-slate-800 rounded focus:ring-0 text-purple-600"
                  />
                  <span className={subtask.completed ? "line-through text-slate-600" : ""}>
                    {subtask.title}
                  </span>
                </label>
                <button
                  onClick={() => onDeleteSubtask(subtask.id)}
                  className="text-slate-600 hover:text-red-400 p-0.5 rounded transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
            
            {/* Quick add subtask form */}
            <div className="flex gap-2 pt-1">
              <input
                type="text"
                placeholder="Add subtask..."
                value={newSubtaskText}
                onChange={(e) => setNewSubtaskText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onAddSubtask()}
                className="flex-1 bg-slate-950/80 border border-slate-800 px-2 py-1 rounded text-xs focus:outline-none focus:border-purple-500/30"
              />
              <button
                onClick={onAddSubtask}
                disabled={loadingSubtask}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-2 py-1 rounded cursor-pointer transition-colors"
              >
                +
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Move Status Toggler */}
      <div className="pt-2">
        <button
          onClick={onToggleStatus}
          className={`w-full py-1.5 text-center text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
            task.status === "COMPLETED" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
            task.status === "IN_PROGRESS" ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
            "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
          }`}
        >
          Status: {task.status === "IN_PROGRESS" ? "In Progress" : task.status} ➔
        </button>
      </div>

    </motion.div>
  );
}
