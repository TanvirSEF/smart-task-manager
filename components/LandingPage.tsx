"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, CheckCircle2, BrainCircuit, Zap, Shield } from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-purple-500/30 selection:text-purple-200 overflow-hidden relative">
      {/* Background Glowing Ambient Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-purple-600/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[20%] right-[-10%] w-[35rem] h-[35rem] bg-indigo-600/10 rounded-full blur-[150px]" />
      </div>

      {/* Header / Navbar */}
      <header className="relative z-10 max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-slate-900/60">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-gradient-to-tr from-purple-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-950/40">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none tracking-tight text-white">SmartTask</h1>
            <span className="text-[10px] font-semibold tracking-wider text-purple-400 uppercase">Premium AI</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/sign-in"
            className="text-sm font-medium text-slate-300 hover:text-white transition-colors px-4 py-2"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-purple-950/20 hover:shadow-purple-900/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-24 text-center space-y-12">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="h-3.5 w-3.5" />
            AI-Powered Productivity
          </div>

          <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent leading-tight sm:leading-none">
            Manage Tasks Smarter <br className="hidden sm:block" />
            With Adaptive Intelligence
          </h2>

          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Unleash your productivity. SmartTask parses natural language inputs, builds automatic task checklists, and coaches you with AI-driven insights customized to your workload.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/sign-up"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold text-base px-8 py-4 rounded-2xl shadow-xl shadow-purple-950/40 hover:shadow-purple-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Get Started Free
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            href="/sign-in"
            className="w-full sm:w-auto flex items-center justify-center bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-700 text-slate-200 font-semibold text-base px-8 py-4 rounded-2xl transition-all"
          >
            Live Demo
          </Link>
        </div>

        {/* Hero Visual Mockup */}
        <div className="relative max-w-5xl mx-auto pt-10">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10 pointer-events-none" />
          <div className="p-1.5 bg-gradient-to-tr from-purple-600/30 via-slate-800/50 to-indigo-500/30 rounded-3xl border border-slate-800/50 shadow-2xl">
            <div className="bg-slate-950 rounded-2xl overflow-hidden border border-slate-800/60 p-8 min-h-[300px] flex flex-col justify-between text-left space-y-8">
              {/* Fake dashboard interface */}
              <div className="flex items-center justify-between border-b border-slate-900 pb-4">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-rose-500" />
                  <div className="h-3 w-3 rounded-full bg-amber-500" />
                  <div className="h-3 w-3 rounded-full bg-emerald-500" />
                </div>
                <div className="text-xs text-slate-500 font-mono">localhost:3000/dashboard</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Column 1 */}
                <div className="bg-slate-900/30 border border-slate-900 p-5 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">TODO Pipeline</span>
                    <span className="h-5 w-5 bg-purple-500/10 text-purple-400 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                  </div>
                  <div className="bg-slate-900/70 border border-slate-800/60 p-4 rounded-xl space-y-3">
                    <h4 className="font-semibold text-sm">Review design system proposal</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-rose-500/10 text-rose-400 px-2.5 py-0.5 rounded-full font-bold uppercase">High</span>
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-2.5 py-0.5 rounded-full">Work</span>
                    </div>
                  </div>
                </div>

                {/* Column 2 */}
                <div className="bg-slate-900/30 border border-slate-900 p-5 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">In Progress</span>
                    <span className="h-5 w-5 bg-indigo-500/10 text-indigo-400 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                  </div>
                  <div className="bg-slate-900/70 border border-slate-800/60 p-4 rounded-xl space-y-3">
                    <h4 className="font-semibold text-sm">Integrate OpenAI Parser</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2.5 py-0.5 rounded-full font-bold uppercase">Medium</span>
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-2.5 py-0.5 rounded-full">Dev</span>
                    </div>
                    <div className="border-t border-slate-800/60 pt-3 space-y-2">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <CheckCircle2 className="h-3.5 w-3.5 text-indigo-500" />
                        <span>Setup API Endpoint</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <div className="h-3.5 w-3.5 rounded-full border border-slate-700" />
                        <span>Implement UI response cards</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 3 */}
                <div className="bg-slate-900/30 border border-slate-900 p-5 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Completed</span>
                    <span className="h-5 w-5 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                  </div>
                  <div className="bg-slate-900/70 border border-slate-800/60 p-4 rounded-xl opacity-60 line-through space-y-2">
                    <h4 className="font-semibold text-sm text-slate-400">Setup Clerk Middleware</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-slate-900/80">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="p-8 bg-slate-900/20 border border-slate-900 hover:border-slate-800 rounded-3xl space-y-4 transition-all hover:scale-[1.01]">
            <div className="h-12 w-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-400 border border-purple-500/10">
              <BrainCircuit className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold">Natural Language parsing</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Simply type how you speak: "Add high priority task write proposal tomorrow 9 AM". OpenAI parses the data instantly.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-8 bg-slate-900/20 border border-slate-900 hover:border-slate-800 rounded-3xl space-y-4 transition-all hover:scale-[1.01]">
            <div className="h-12 w-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/10">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold">Checklist Generation</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Get customized subtask checklists created by AI for any task, ensuring you never miss a step in your workflows.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-8 bg-slate-900/20 border border-slate-900 hover:border-slate-800 rounded-3xl space-y-4 transition-all hover:scale-[1.01]">
            <div className="h-12 w-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 border border-emerald-500/10">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold">Secure Multi-Tenancy</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Powered by Clerk Auth and MongoDB. Your tasks are isolated, completely encrypted, and safely secured under your account.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-900/60 max-w-7xl mx-auto px-6 py-8 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} SmartTask. Built with Next.js, Clerk, MongoDB, and OpenAI.
      </footer>
    </div>
  );
}
