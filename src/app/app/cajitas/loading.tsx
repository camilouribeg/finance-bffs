export default function Loading() {
  return (
    <div className="max-w-2xl mx-auto animate-pulse">
      <div className="flex justify-between mb-8">
        <div>
          <div className="h-8 w-32 bg-[#ffb8e0] rounded-xl mb-2" />
          <div className="h-4 w-52 bg-[#ffb8e0]/60 rounded-lg" />
        </div>
        <div className="h-10 w-32 bg-[#ffb8e0] rounded-xl" />
      </div>

      {/* Summary */}
      <div className="bg-white rounded-2xl border border-[#ffb8e0] p-5 mb-6">
        <div className="h-4 w-40 bg-[#ffb8e0]/60 rounded mb-3" />
        <div className="h-8 w-32 bg-[#ffb8e0] rounded-xl" />
      </div>

      {/* Cajita cards */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-2xl border border-[#ffb8e0] p-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-[#ffb8e0] rounded-xl" />
              <div>
                <div className="h-5 w-28 bg-[#ffb8e0] rounded mb-1" />
                <div className="h-3 w-20 bg-[#ffb8e0]/50 rounded" />
              </div>
            </div>
            <div className="h-8 w-20 bg-[#ffb8e0]/60 rounded-full" />
          </div>
          <div className="h-2 bg-[#ffb8e0] rounded-full mb-2" />
          <div className="flex justify-between">
            <div className="h-3 w-16 bg-[#ffb8e0]/50 rounded" />
            <div className="h-3 w-16 bg-[#ffb8e0]/50 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
