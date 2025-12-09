export function ProductGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-2xl border border-white/10 bg-white/5 p-6"
        >
          <div className="mb-4 flex items-start justify-between">
            <div className="h-6 w-3/4 rounded bg-white/10"></div>
            <div className="h-5 w-16 rounded-full bg-white/10"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 w-full rounded bg-white/10"></div>
            <div className="h-4 w-5/6 rounded bg-white/10"></div>
          </div>
          <div className="mt-6 flex items-center justify-between">
            <div className="h-8 w-20 rounded bg-white/10"></div>
            <div className="h-10 w-32 rounded-lg bg-white/10"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 w-24 rounded bg-white/10"></div>
      <div className="h-10 w-3/4 rounded bg-white/10"></div>
      <div className="h-12 w-32 rounded bg-white/10"></div>
      <div className="space-y-3">
        <div className="h-4 w-full rounded bg-white/10"></div>
        <div className="h-4 w-full rounded bg-white/10"></div>
        <div className="h-4 w-4/5 rounded bg-white/10"></div>
      </div>
      <div className="space-y-2">
        <div className="h-4 w-24 rounded bg-white/10"></div>
        <div className="h-4 w-full rounded bg-white/10"></div>
        <div className="h-4 w-full rounded bg-white/10"></div>
        <div className="h-4 w-3/4 rounded bg-white/10"></div>
      </div>
    </div>
  );
}

export function CartSummarySkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="mb-4 h-6 w-32 rounded bg-white/10"></div>
      <div className="space-y-3">
        <div className="h-4 w-full rounded bg-white/10"></div>
        <div className="h-4 w-3/4 rounded bg-white/10"></div>
      </div>
      <div className="mt-6 h-12 w-full rounded-lg bg-white/10"></div>
    </div>
  );
}
