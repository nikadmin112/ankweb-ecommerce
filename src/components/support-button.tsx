import { MessageCircle } from 'lucide-react';

export function SupportButton() {
  return (
    <div className="fixed bottom-5 left-5 z-50">
      <a
        href="https://telegram.me/ankiitashaarma"
        aria-label="Get Support if any issues"
        className="group relative inline-flex h-12 w-12 items-center justify-center rounded-full bg-purple-600 border border-purple-500 text-white shadow-lg shadow-purple-500/20 transition hover:bg-purple-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
      >
        <MessageCircle className="h-5 w-5" />
        <span className="pointer-events-none absolute left-full top-1/2 ml-3 -translate-y-1/2 whitespace-nowrap rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs font-semibold text-white opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-visible:opacity-100">
          Get Support if any issues
        </span>
      </a>
    </div>
  );
}
