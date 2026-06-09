# Smart Task Manager 📝 + OpenAI GPT-4o 🔮

A modern, responsive task manager built with **Next.js 16**, **TypeScript 6**, and **Tailwind CSS v4** — featuring smart AI-powered subtask suggestions using the **OpenAI API** (`gpt-4o-mini`).

---

## 🔧 Features

- ✅ **Task Management**: Add, edit, and delete tasks dynamically.
- ✅ **OpenAI Subtask Suggestions**: Auto-generate 3-5 actionable subtasks for any task with the click of a button.
- ✅ **React 19 Rendering**: Optimized form state reset using dynamic key-prop mounting.
- ✅ **Responsive Design**: Elegant UI optimized for both mobile and desktop screens.
- ✅ **Zero Database Overhead**: Lightweight and state-driven (local state).

---

## 🚀 Tech Stack

- **Next.js 16** (App Router & Turbopack)
- **React 19**
- **TypeScript 6**
- **Tailwind CSS v4**
- **OpenAI API** (via Next.js API Route)
- **pnpm** (Package Manager)

---

## 📦 Setup Instructions

Follow these steps to run the project locally:

1. **Clone the repository**
   ```bash
   git clone https://github.com/TanvirSEF/smart-task-manager.git
   cd smart-task-manager
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Configure Environment Variables**
   Create a `.env.local` file in the root of the project and add your OpenAI API Key:
   ```env
   OPENAI_API_KEY="your-openai-api-key-here"
   ```
   *(Note: A `.env.example` file is provided in the repository for reference).*

4. **Run the Development Server**
   ```bash
   pnpm dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

5. **Build for Production**
   To test production builds:
   ```bash
   pnpm build
   ```
