import { Play, ArrowRight } from "lucide-react";
import { Link } from "react-router";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FDF3EC] text-slate-900 font-sans selection:bg-[#F27A58]/20">

      {/* Top navigation bar */}
      <header className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">

        {/* BrainMemora logo */}
        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm border border-black/5">
          <div className="w-8 h-8 rounded-full bg-[#F27A58]/20 flex items-center justify-center text-[#F27A58] font-bold">
            🧠
          </div>

          <span className="font-bold text-sm tracking-tight text-slate-800">
            BrainMemora
          </span>
        </div>

        {/* Links to sections on this page */}
        <nav className="hidden md:flex items-center gap-8 bg-white/70 backdrop-blur-md px-8 py-2.5 rounded-full shadow-sm border border-black/5 text-sm font-medium text-slate-700">
          <a href="#features" className="hover:text-[#F27A58] transition-colors">
            Features
          </a>

          <a href="#how-it-works" className="hover:text-[#F27A58] transition-colors">
            How it works
          </a>

          <a href="#benefits" className="hover:text-[#F27A58] transition-colors">
            Benefits
          </a>
        </nav>

        {/* Buttons to open Login and Register pages */}
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="px-5 py-2 text-sm font-semibold text-slate-700 bg-white/80 hover:bg-white rounded-full shadow-sm border border-black/5 transition-all"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="px-5 py-2 text-sm font-semibold text-white bg-[#F27A58] hover:bg-[#E06846] rounded-full shadow-md shadow-[#F27A58]/20 transition-all"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Main heading and introduction */}
      <section className="max-w-7xl mx-auto px-6 pt-12 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

        {/* Heading, description, and buttons */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
            Transform Scattered Information
          </h1>

          <h2 className="text-4xl lg:text-5xl font-extrabold text-[#F27A58] tracking-tight">
            into Organized Knowledge
          </h2>

          <p className="text-slate-600 text-base lg:text-lg max-w-lg leading-relaxed">
            Collect notes, PDFs, articles, and videos in one calm workspace.
            Practice with AI flashcards, track revision cycles, and build
            lifelong learning habits.
          </p>

          {/* Buttons to start learning or explore the demo */}
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link
              to="/register"
              className="flex items-center gap-2 px-6 py-3.5 bg-[#F27A58] hover:bg-[#E06846] text-white font-semibold rounded-full shadow-lg shadow-[#F27A58]/25 transition-all group"
            >
              Start Learning Free

              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <button
              type="button"
              className="flex items-center gap-2 px-6 py-3.5 bg-white/80 hover:bg-white text-slate-700 font-semibold rounded-full shadow-sm border border-black/5 transition-all"
            >
              <span className="text-xs text-slate-400">▶</span>
              Explore App Demo
            </button>
          </div>
        </div>

        {/* Picture area on the right side */}
        <div className="lg:col-span-6 relative flex justify-center">
          <div className="w-full max-w-lg bg-[#F8ECE3] p-4 rounded-[32px] shadow-xl border border-black/5 relative overflow-hidden group">

            {/* Background for the app illustration */}
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#F5E6DA] to-[#ECD4C4] p-8 aspect-[4/3] flex items-center justify-center">

              {/* Small dots in the background */}
              <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#F27A58_1px,transparent_1px)] [background-size:16px_16px]"></div>

              {/* Play button in the centre */}
              <div className="w-16 h-16 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-2xl z-10 cursor-pointer hover:scale-105 transition-transform">
                <Play className="w-6 h-6 fill-white ml-1" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20">

        {/* Features heading */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl lg:text-3xl font-extrabold text-slate-900">
            Built for Lifelong Learners & Developers
          </h2>
        </div>

        {/* Four feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          {/* Card 1: Store learning materials */}
          <div className="bg-[#A7C1D0] p-6 rounded-3xl shadow-sm flex flex-col justify-between h-72 text-slate-900">
            <div>
              <h3 className="font-bold text-lg mb-3">
                Unified Knowledge Hub
              </h3>

              <p className="text-sm opacity-90 leading-relaxed">
                Manage PDFs, articles, notes, links, and video transcripts
                in one organized place.
              </p>
            </div>

            <button
              type="button"
              className="self-start px-4 py-2 bg-[#3A4A43] text-white text-xs font-semibold rounded-full shadow-sm hover:bg-black transition-colors"
            >
              Explore Hub
            </button>
          </div>

          {/* Card 2: Create flashcards */}
          <div className="bg-[#D9A399] p-6 rounded-3xl shadow-sm flex flex-col justify-between h-72 text-slate-900">
            <div>
              <h3 className="font-bold text-lg mb-3">
                Smart Flashcards
              </h3>

              <p className="text-sm opacity-90 leading-relaxed">
                Turn your notes and learning materials into simple flashcards
                for easy revision.
              </p>
            </div>

            <button
              type="button"
              className="self-start px-4 py-2 bg-[#3A4A43] text-white text-xs font-semibold rounded-full shadow-sm hover:bg-black transition-colors"
            >
              Study Decks
            </button>
          </div>

          {/* Card 3: Build regular learning habits */}
          <div className="bg-[#F2D69B] p-6 rounded-3xl shadow-sm flex flex-col justify-between h-72 text-slate-900">
            <div>
              <h3 className="font-bold text-lg mb-3">
                Gamified Habits
              </h3>

              <p className="text-sm opacity-90 leading-relaxed">
                Revise through engaging learning challenges, earn points,
                unlock levels, and achieve rewards.
              </p>
            </div>

            <button
              type="button"
              className="self-start px-4 py-2 bg-[#3A4A43] text-white text-xs font-semibold rounded-full shadow-sm hover:bg-black transition-colors"
            >
              View Badges
            </button>
          </div>

          {/* Card 4: Get help from AI */}
          <div className="bg-[#B5CDA8] p-6 rounded-3xl shadow-sm flex flex-col justify-between h-72 text-slate-900">
            <div>
              <h3 className="font-bold text-lg mb-3">
                AI Learning Assistant
              </h3>

              <p className="text-sm opacity-90 leading-relaxed">
                Get summaries, explanations, flashcards, and quizzes from
                your documents to make learning easier.
              </p>
            </div>

            <button
              type="button"
              className="self-start px-4 py-2 bg-[#3A4A43] text-white text-xs font-semibold rounded-full shadow-sm hover:bg-black transition-colors"
            >
              Try AI Coach
            </button>
          </div>
        </div>
      </section>

      {/* Steps showing how BrainMemora works */}
      <section
        id="how-it-works"
        className="max-w-7xl mx-auto px-6 py-20 mb-20"
      >

        {/* Steps heading */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl lg:text-3xl font-extrabold text-slate-900">
            How BrainMemora Works in 3 Simple Steps
          </h2>
        </div>

        {/* Three steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Step 1: Collect learning materials */}
          <div className="bg-[#CCDCD4] p-8 rounded-3xl shadow-sm relative flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-full bg-[#F27A58] text-white font-bold text-lg flex items-center justify-center mb-6 shadow-md">
                1
              </div>

              <h3 className="font-bold text-xl mb-3 text-slate-900">
                Collect & Import
              </h3>

              <p className="text-slate-700 text-sm leading-relaxed">
                Save PDFs, notes, articles, and video links into your
                organized personal library.
              </p>
            </div>
          </div>

          {/* Step 2: Study using learning tools */}
          <div className="bg-[#CCDCD4] p-8 rounded-3xl shadow-sm relative flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-full bg-[#F27A58] text-white font-bold text-lg flex items-center justify-center mb-6 shadow-md">
                2
              </div>

              <h3 className="font-bold text-xl mb-3 text-slate-900">
                Synthesize & Study
              </h3>

              <p className="text-slate-700 text-sm leading-relaxed">
                Turn your materials into instant AI flashcards and quick
                practice quizzes.
              </p>
            </div>
          </div>

          {/* Step 3: Review and remember */}
          <div className="bg-[#CCDCD4] p-8 rounded-3xl shadow-sm relative flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-full bg-[#F27A58] text-white font-bold text-lg flex items-center justify-center mb-6 shadow-md">
                3
              </div>

              <h3 className="font-bold text-xl mb-3 text-slate-900">
                Review & Retain
              </h3>

              <p className="text-slate-700 text-sm leading-relaxed">
                Get smart study reminders at the best times to remember
                everything long-term.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

