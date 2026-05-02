export default function Changelog() {
  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-4xl font-extrabold text-white mb-12 tracking-tight">Changelog</h1>
      
      <div className="relative border-l border-gray-800 pl-8 ml-4">
        
        {/* v0.48 */}
        <div className="mb-16 relative">
          <span className="absolute -left-[37px] top-1.5 w-2.5 h-2.5 rounded-full bg-brand-500 shadow-[0_0_0_4px_rgba(0,0,0,1)] ring-1 ring-brand-500/50"></span>
          <div className="flex flex-col gap-1 mb-5">
            <h2 className="text-2xl font-bold text-white">v0.48 - Expanded Decision Engine Capabilities</h2>
          </div>
          <div className="text-gray-300 space-y-5 text-base leading-relaxed">
            <p>
              In this release, we expanded BaaS's capabilities to function as a full <strong>Decision Engine</strong>, emphasizing its ability to explain complex business logic and act as deterministic AI guardrails.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-400 marker:text-gray-600">
              <li><strong className="text-gray-200">Core Engine:</strong> Expanded functionality to serve as a comprehensive Decision Engine.</li>
              <li><strong className="text-gray-200">UI Enhancements:</strong> Added a floating actions toolbar for quicker rule manipulation.</li>
              <li><strong className="text-gray-200">Bug Fixes:</strong> Fixed priority issues when pasting from another ruleset.</li>
              <li><strong className="text-gray-200">Editor Updates:</strong> Included an empty state row for clearer initial ruleset creation.</li>
              <li><strong className="text-gray-200">Repository:</strong> Added standardized PR Templates.</li>
            </ul>
          </div>
        </div>

        {/* v0.47 */}
        <div className="mb-16 relative">
          <span className="absolute -left-[37px] top-1.5 w-2.5 h-2.5 rounded-full bg-gray-800 shadow-[0_0_0_4px_rgba(0,0,0,1)] ring-1 ring-gray-700"></span>
          <div className="flex flex-col gap-1 mb-5">
            <h2 className="text-2xl font-bold text-gray-300">v0.47 - Workflow & Documentation</h2>
          </div>
          <div className="text-gray-400 space-y-5 text-base leading-relaxed">
            <ul className="list-disc pl-5 space-y-2 marker:text-gray-600">
              <li><strong className="text-gray-300">Editor:</strong> Implemented drag and drop (DnD) functionality for rules.</li>
              <li><strong className="text-gray-300">Events:</strong> Fired a change ruleset event upon creating a new ruleset.</li>
              <li><strong className="text-gray-300">Documentation:</strong> Significant improvements to the README and a refined contribution guide.</li>
              <li><strong className="text-gray-300">Polishing:</strong> Various text cleanups across the UI.</li>
            </ul>
          </div>
        </div>

        {/* v0.46 */}
        <div className="mb-16 relative">
          <span className="absolute -left-[37px] top-1.5 w-2.5 h-2.5 rounded-full bg-gray-800 shadow-[0_0_0_4px_rgba(0,0,0,1)] ring-1 ring-gray-700"></span>
          <div className="flex flex-col gap-1 mb-5">
            <h2 className="text-2xl font-bold text-gray-300">v0.46 - Quality & CI/CD</h2>
          </div>
          <div className="text-gray-400 space-y-5 text-base leading-relaxed">
            <ul className="list-disc pl-5 space-y-2 marker:text-gray-600">
              <li><strong className="text-gray-300">Testing:</strong> Setup comprehensive tests and test coverage reporting.</li>
              <li><strong className="text-gray-300">CI/CD:</strong> Integrated SonarQube and SonarCloud GitHub Actions.</li>
              <li><strong className="text-gray-300">Automation:</strong> Added logic to make sure the analyzed PR code matches the diff.</li>
            </ul>
          </div>
        </div>

        {/* v0.45 */}
        <div className="mb-16 relative">
          <span className="absolute -left-[37px] top-1.5 w-2.5 h-2.5 rounded-full bg-gray-800 shadow-[0_0_0_4px_rgba(0,0,0,1)] ring-1 ring-gray-700"></span>
          <div className="flex flex-col gap-1 mb-5">
            <h2 className="text-2xl font-bold text-gray-300">v0.45 - State Machine & UI Polish</h2>
          </div>
          <div className="text-gray-400 space-y-5 text-base leading-relaxed">
            <ul className="list-disc pl-5 space-y-2 marker:text-gray-600">
              <li><strong className="text-gray-300">Evaluation:</strong> Made session context available during rule evaluation.</li>
              <li><strong className="text-gray-300">Samples:</strong> Added missing statistics sample JSON.</li>
              <li><strong className="text-gray-300">UI Tweaks:</strong> Resized the rules and editor panes for a better authoring experience.</li>
              <li><strong className="text-gray-300">Documentation:</strong> Added inline markdown support for rule descriptions.</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
