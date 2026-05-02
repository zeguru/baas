import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const images = [
    "baas-when.png",
    "baas-then.png",
    "baas-try-it.png",
    "baas-range-lookup.png",
    "baas-value-lookup.png",
    "baas-value-range-lookup.png",
    "baas-expression.png",
  ];

  // Duplicate for seamless infinite marquee scrolling
  const marqueeImages = [...images, ...images];

  return (
    <div className="flex flex-col gap-16 py-8 overflow-hidden">
      <section className="flex flex-col gap-6 text-center max-w-3xl mx-auto z-10">
        <h1 className="text-5xl font-extrabold tracking-tight text-white leading-tight">
          The Decision Layer Your <br/> Software Has Always Needed.
        </h1>
        <p className="text-xl text-gray-400 leading-relaxed">
          An open-source, explainable, API-first decision engine built for enterprises, developers, and the age of AI.
        </p>
        <div className="flex items-center justify-center gap-4 mt-6">
          <Link href="/blog/the-decision-layer" className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-md transition-colors shadow-lg shadow-brand-500/20">
            Read the Announcement
          </Link>
          <a href="https://github.com/zeguru/baas" target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-md border border-gray-700 transition-colors">
            View on GitHub
          </a>
        </div>
      </section>

      {/* Animated Screenshots Marquee */}
      <section className="relative mt-8 -mx-6 md:-mx-20 overflow-hidden mask-edges perspective-grid z-0">
        <div className="flex w-max gap-8 animate-marquee items-center py-10 rotate-y-10 hover:rotate-y-0 transition-transform duration-1000 ease-out cursor-pointer">
          {marqueeImages.map((src, i) => (
            <div key={i} className="relative flex-shrink-0 group">
              <div className="absolute inset-0 bg-brand-500/30 blur-2xl rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <Image 
                src={`/images/${src}`} 
                alt={`BaaS Editor Interface - ${src.replace('.png', '').replace(/-/g, ' ')}`}
                width={600} 
                height={350} 
                className="relative rounded-xl border border-gray-800 shadow-2xl bg-gray-950 object-cover transform group-hover:scale-105 transition-transform duration-500"
                unoptimized
                priority={i < 4}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto text-center mt-12 z-10 px-6">
        <h2 className="text-3xl font-bold text-white mb-6">The Problem Nobody Talks About Enough</h2>
        <div className="text-gray-400 text-lg leading-relaxed space-y-4">
          <p>
            Every software system that matters makes decisions. Whether it is pricing a policy, calculating net pay, or guiding an AI agent—the engine underneath is always governed by rules.
          </p>
          <p className="text-gray-300 font-medium">
            And here is the uncomfortable truth: those rules are buried.
          </p>
          <p>
            They are buried in conditional statements three levels deep inside a service class. They are buried in stored procedures. They are buried in Excel sheets. Traditional rule engines are often too expensive, mandate stack lock-in, and fail to tell you <em>why</em> a decision was made.
          </p>
          <p className="text-brand-400 font-semibold mt-4">
            BaaS provides an explicit, testable, and deeply explainable place to put them.
          </p>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-10 mt-8 border-t border-gray-800 pt-16 z-10">
        <div className="flex flex-col gap-4">
          <div className="w-12 h-12 rounded-lg bg-gray-900 flex items-center justify-center border border-gray-800 mb-2 shadow-sm shadow-black">
            <svg className="w-6 h-6 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
          </div>
          <h3 className="text-xl font-semibold text-white tracking-tight">API-First & Agnostic</h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            Exposed through a clean REST API. Whether your stack is Node, Python, Java, or Go, BaaS drops in instantly as your centralized logic layer.
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <div className="w-12 h-12 rounded-lg bg-gray-900 flex items-center justify-center border border-gray-800 mb-2 shadow-sm shadow-black">
            <svg className="w-6 h-6 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
          </div>
          <h3 className="text-xl font-semibold text-white tracking-tight">Decision Traces</h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            Do not just get a result. Get a full, human-readable breakdown of every rule evaluated, explaining exactly why a decision was reached.
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <div className="w-12 h-12 rounded-lg bg-gray-900 flex items-center justify-center border border-gray-800 mb-2 shadow-sm shadow-black">
            <svg className="w-6 h-6 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <h3 className="text-xl font-semibold text-white tracking-tight">AI Guardrails</h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            Provide deterministic boundaries for probabilistic AI. Ground agentic workflows in concrete business reality with explicit constraints.
          </p>
        </div>
      </section>
      
      <section className="mt-8 border border-gray-800 bg-gray-900/30 rounded-xl p-6 sm:p-8 lg:p-10 flex flex-col md:flex-row items-center justify-between gap-8 z-10">
        <div className="text-center md:text-left">
          <h2 className="text-2xl font-bold text-white mb-3">Run it locally in seconds</h2>
          <p className="text-gray-400 text-sm max-w-md leading-relaxed mb-4 mx-auto md:mx-0">
            Pull the official Docker image and spin up the engine, API docs, and visual editor on your machine instantly.
          </p>
        </div>
        <div className="bg-black p-4 sm:p-5 rounded-lg border border-gray-800 w-full md:w-auto shadow-inner group hover:border-gray-600 transition-colors overflow-x-auto">
          <code className="text-brand-400 font-mono text-sm block whitespace-nowrap group-hover:text-brand-300 transition-colors">docker run -p 3000:3000 zeguru/baas:latest</code>
        </div>
      </section>
    </div>
  );
}
