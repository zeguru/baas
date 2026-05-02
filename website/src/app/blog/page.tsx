import Link from "next/link";

export default function BlogList() {
  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-4xl font-extrabold text-white mb-12 tracking-tight">Blog</h1>
      
      <div className="flex flex-col gap-8">
        <article className="group border border-gray-800 bg-gray-900/20 p-8 rounded-xl hover:border-gray-700 hover:bg-gray-900/40 transition-all duration-200">
          <time className="text-xs text-gray-500 font-mono mb-4 block uppercase tracking-wider">May 2026</time>
          <h2 className="text-2xl font-bold text-white mb-4 leading-snug group-hover:text-brand-400 transition-colors">
            <Link href="/blog/the-decision-layer" className="focus:outline-none">
              <span className="absolute inset-0" aria-hidden="true" />
              The Decision Layer Your Software Has Always Needed
            </Link>
          </h2>
          <p className="text-gray-400 text-base leading-relaxed mb-6">
            An open-source, explainable, API-first decision engine built for enterprises, developers, and the age of AI. Learn why rule engines failed in the past, and how BaaS introduces a new path forward.
          </p>
          <div className="text-sm font-semibold text-brand-500 flex items-center gap-1 group-hover:text-brand-400 transition-colors">
            Read article <svg className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </div>
        </article>
      </div>
    </div>
  );
}
