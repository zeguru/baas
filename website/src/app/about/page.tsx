export default function About() {
  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-4xl font-extrabold text-white mb-8 tracking-tight">About BaaS</h1>
      
      <div className="space-y-8 text-gray-300 text-base leading-relaxed">
        <p>
          Every software system that matters makes decisions. Whether it is pricing policies, calculating deductions, or defining AI guardrails, business logic is everywhere.
          BaaS (Business Logic As A Service) was built to decouple this logic from application code, giving engineers, product managers, and compliance teams a transparent, single source of truth.
        </p>
        
        <h2 className="text-2xl font-bold text-white mt-12 mb-4">Our Mission</h2>
        <p>
          To provide a clean, stack-agnostic decision layer that is easy to deploy, simple to use, and unequivocally clear in its execution. 
          We believe that decision engines should not require complex licensing or vendor lock-in. That is why BaaS is completely open-source.
        </p>

        <h2 className="text-2xl font-bold text-white mt-12 mb-4">Core Principles</h2>
        <ul className="list-none space-y-4 pl-0">
          <li className="flex gap-3">
            <span className="text-brand-500 font-bold mt-1">✓</span>
            <div>
              <strong className="text-white block mb-1">Simplicity</strong>
              <span className="text-gray-400">Resist all temptations to make the tool unnecessarily complex. Setup is a single command.</span>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="text-brand-500 font-bold mt-1">✓</span>
            <div>
              <strong className="text-white block mb-1">Explainability</strong>
              <span className="text-gray-400">Decisions must not just be accurate; they must provide a trace of exactly how they were reached.</span>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="text-brand-500 font-bold mt-1">✓</span>
            <div>
              <strong className="text-white block mb-1">Stack Agnosticism</strong>
              <span className="text-gray-400">A decision engine should work with your existing tools, speaking standard REST and JSON.</span>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="text-brand-500 font-bold mt-1">✓</span>
            <div>
              <strong className="text-white block mb-1">Developer Experience</strong>
              <span className="text-gray-400">Rapid local testing via our embedded UI or API without friction.</span>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
}
