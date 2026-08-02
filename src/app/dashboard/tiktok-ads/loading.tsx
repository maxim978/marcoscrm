export default function TikTokAdsLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-64 bg-slate-200 rounded-lg animate-pulse" />
        <div className="h-4 w-96 bg-slate-100 rounded animate-pulse" />
      </div>

      {/* KPI grid skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl ring-1 ring-slate-200 p-4 space-y-2">
            <div className="h-3 w-20 bg-slate-100 rounded animate-pulse" />
            <div className="h-7 w-28 bg-slate-200 rounded animate-pulse" />
            <div className="h-3 w-16 bg-slate-100 rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Chart skeleton */}
      <div className="bg-white rounded-xl ring-1 ring-slate-200 p-4">
        <div className="h-4 w-40 bg-slate-100 rounded animate-pulse mb-4" />
        <div className="h-72 bg-slate-50 rounded-lg animate-pulse" />
      </div>

      {/* Table skeleton */}
      <div className="bg-white rounded-xl ring-1 ring-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <div className="h-4 w-32 bg-slate-100 rounded animate-pulse" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="px-4 py-3 border-b border-slate-50 flex gap-4">
            <div className="h-4 flex-1 bg-slate-100 rounded animate-pulse" />
            <div className="h-4 w-16 bg-slate-100 rounded animate-pulse" />
            <div className="h-4 w-20 bg-slate-100 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}
