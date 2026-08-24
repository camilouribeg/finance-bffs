export default function Loading() {
  return (
    <div className="max-w-2xl mx-auto animate-pulse">
      <div className="flex justify-between mb-8">
        <div>
          <div className="h-8 w-44 bg-[#ffb8e0] rounded-xl mb-2" />
          <div className="h-4 w-56 bg-[#ffb8e0]/60 rounded-lg" />
        </div>
        <div className="h-10 w-32 bg-[#ffb8e0] rounded-xl" />
      </div>

      {/* Total saved */}
      <div className="bg-white rounded-2xl border border-[#ffb8e0] p-5 mb-6">
        <div className="h-4 w-32 bg-[#ffb8e0]/60 rounded mb-2" />
        <div className="h-9 w-40 bg-[#ffb8e0] rounded-xl mb-2" />
        <div className="h-2 bg-[#ffb8e0] rounded-full" />
      </div>

      {/* Bolsillo cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-[#ffb8e0] p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 bg-[#ffb8e0] rounded-xl" />
              <div>
                <div className="h-4 w-24 bg-[#ffb8e0] rounded mb-1" />
                <div className="h-3 w-16 bg-[#ffb8e0]/50 rounded" />
              </div>
            </div>
            <div className="flex justify-between mb-1">
              <div className="h-3 w-16 bg-[#ffb8e0]/60 rounded" />
              <div className="h-3 w-10 bg-[#ffb8e0] rounded" />
            </div>
            <div className="h-2 bg-[#ffb8e0] rounded-full mb-2" />
            <div className="h-3 w-24 bg-[#ffb8e0]/50 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
