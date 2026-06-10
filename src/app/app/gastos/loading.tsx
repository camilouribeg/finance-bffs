export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto animate-pulse">
      <div className="flex justify-between mb-8">
        <div>
          <div className="h-8 w-36 bg-[#ffb8e0] rounded-xl mb-2" />
          <div className="h-4 w-48 bg-[#ffb8e0]/60 rounded-lg" />
        </div>
        <div className="h-10 w-32 bg-[#ffb8e0] rounded-xl" />
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-[#ffb8e0] p-4">
            <div className="h-3 w-20 bg-[#ffb8e0]/60 rounded mb-2" />
            <div className="h-7 w-28 bg-[#ffb8e0] rounded-xl" />
          </div>
        ))}
      </div>

      {/* Chart placeholder */}
      <div className="bg-white rounded-2xl border border-[#ffb8e0] p-6 mb-6">
        <div className="h-5 w-32 bg-[#ffb8e0] rounded mb-4" />
        <div className="h-40 bg-[#ffedfa] rounded-xl" />
      </div>

      {/* Transaction list */}
      <div className="bg-white rounded-2xl border border-[#ffb8e0] p-6">
        <div className="h-5 w-36 bg-[#ffb8e0] rounded mb-4" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex justify-between items-center py-3 border-b border-[#ffb8e0]/40 last:border-0">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-[#ffb8e0] rounded-full" />
              <div>
                <div className="h-4 w-28 bg-[#ffb8e0] rounded mb-1" />
                <div className="h-3 w-20 bg-[#ffb8e0]/50 rounded" />
              </div>
            </div>
            <div className="h-5 w-20 bg-[#ffb8e0] rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
