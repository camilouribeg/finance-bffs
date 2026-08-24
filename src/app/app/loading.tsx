export default function Loading() {
  return (
    <div className="max-w-5xl mx-auto animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="h-8 w-48 bg-[#ffb8e0] rounded-xl mb-2" />
          <div className="h-4 w-36 bg-[#ffb8e0]/60 rounded-lg" />
        </div>
        <div className="h-10 w-36 bg-[#ffb8e0] rounded-xl" />
      </div>

      {/* Hero cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl border-2 border-[#ffb8e0] p-6">
            <div className="h-3 w-28 bg-[#ffb8e0] rounded mb-3" />
            <div className="h-9 w-40 bg-[#ffb8e0] rounded-xl mb-2" />
            <div className="h-3 w-32 bg-[#ffb8e0]/50 rounded mt-2" />
            <div className="mt-3 h-1.5 bg-[#ffb8e0] rounded-full" />
          </div>
        ))}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-[#ffb8e0] p-4">
            <div className="h-4 w-4 bg-[#ffb8e0] rounded mb-2" />
            <div className="h-3 w-20 bg-[#ffb8e0]/60 rounded mb-1" />
            <div className="h-6 w-24 bg-[#ffb8e0] rounded" />
          </div>
        ))}
      </div>

      {/* Content blocks */}
      {[1, 2].map((i) => (
        <div key={i} className="bg-white rounded-2xl border border-[#ffb8e0] p-6 mb-4">
          <div className="flex justify-between mb-4">
            <div className="h-6 w-40 bg-[#ffb8e0] rounded-xl" />
            <div className="h-8 w-20 bg-[#ffb8e0]/60 rounded-full" />
          </div>
          {[1, 2, 3].map((j) => (
            <div key={j} className="flex justify-between py-2 border-b border-[#ffb8e0]/40 last:border-0">
              <div className="h-4 w-32 bg-[#ffb8e0]/60 rounded" />
              <div className="h-4 w-20 bg-[#ffb8e0] rounded" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
