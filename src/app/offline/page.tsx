"use client";

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">You're Offline</h1>
        <p className="text-zinc-400 mb-6">
          Please check your internet connection and try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-lg bg-purple-600 px-6 py-3 text-white font-semibold hover:bg-purple-500 transition border border-purple-500"
        >
          Retry
        </button>
      </div>
    </main>
  );
}
