import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "BaaS - Business Logic As A Service",
  description: "An open-source, explainable, API-first decision engine built for enterprises, developers, and the age of AI.",
};

async function getLatestVersion() {
  try {
    const res = await fetch('https://hub.docker.com/v2/repositories/zeguru/baas/tags?page_size=10');
    if (!res.ok) return 'v0.48';
    const data = await res.json();
    const version = data.results.find((tag: any) => tag.name !== 'latest')?.name || '0.48';
    return version.startsWith('v') ? version : `v${version}`;
  } catch (e) {
    return 'v0.48';
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const version = await getLatestVersion();

  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <header className="border-b border-gray-800">
          <div className="max-w-5xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link href="/" className="text-xl font-bold text-white tracking-tight flex items-center">
              BaaS <span className="text-brand-500 text-[10px] uppercase font-bold ml-3 border border-brand-500/30 bg-brand-500/10 px-1.5 py-0.5 rounded-sm">{version}</span>
            </Link>
            <nav className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm font-medium">
              <Link href="/blog" className="text-gray-400 hover:text-white transition-colors">Blog</Link>
              <Link href="/changelog" className="text-gray-400 hover:text-white transition-colors">Changelog</Link>
              <Link href="/about" className="text-gray-400 hover:text-white transition-colors">About</Link>
              <a href="https://github.com/zeguru/baas" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">GitHub</a>
            </nav>
          </div>
        </header>
        <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-12">
          {children}
        </main>
        <footer className="border-t border-gray-800 py-10 text-center text-sm text-gray-500 flex flex-col items-center gap-2">
          <p>Released under the GNU AGPL v3 license.</p>
          <p>Built for enterprises, developers, and AI.</p>
        </footer>
      </body>
    </html>
  );
}
