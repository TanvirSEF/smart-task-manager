import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative">
      {/* Background glowing effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[20%] w-[30rem] h-[30rem] bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[20%] right-[20%] w-[30rem] h-[30rem] bg-indigo-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl shadow-2xl flex flex-col items-center">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 bg-gradient-to-tr from-purple-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-950/40">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none tracking-tight text-white">SmartTask</h1>
            <span className="text-[10px] font-semibold tracking-wider text-purple-400 uppercase">Premium AI</span>
          </div>
        </div>

        <SignIn
          appearance={{
            elements: {
              card: "bg-transparent border-0 shadow-none p-0 w-full",
              headerTitle: "text-slate-100 font-bold",
              headerSubtitle: "text-slate-400",
              socialButtonsBlockButton: "bg-slate-850 border-slate-700 hover:bg-slate-700 text-slate-100",
              formButtonPrimary: "bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-all",
              formFieldLabel: "text-slate-300",
              formFieldInput: "bg-slate-850/50 border-slate-700/60 text-slate-100 focus:border-purple-500",
              footerActionText: "text-slate-400",
              footerActionLink: "text-purple-400 hover:text-purple-300",
              dividerText: "text-slate-500",
              dividerLine: "bg-slate-800",
              identityPreviewText: "text-slate-200",
              identityPreviewEditButtonIcon: "text-slate-300",
            },
          }}
        />
      </div>
    </div>
  );
}
