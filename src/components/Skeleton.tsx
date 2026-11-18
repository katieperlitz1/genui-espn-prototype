export function SkeletonCard({ height = 120 }: { height?: number }) {
  return (
    <div className="bg-white border border-[#e5e5e5] overflow-hidden" style={{ height }}>
      <div className="bg-[#1a1a1a] h-8 skeleton opacity-60" />
      <div className="p-3 space-y-2" style={{ height: height - 32 }}>
        <div className="skeleton rounded h-4 w-3/4" />
        <div className="skeleton rounded h-4 w-1/2" />
        <div className="skeleton rounded h-4 w-5/6" />
      </div>
    </div>
  )
}

export function SkeletonLayout() {
  return (
    <div className="flex flex-col gap-4">
      <SkeletonCard height={160} />
      <div className="grid grid-cols-2 gap-3">
        <SkeletonCard height={200} />
        <SkeletonCard height={200} />
      </div>
      <SkeletonCard height={240} />
      <div className="grid grid-cols-2 gap-3">
        <SkeletonCard height={140} />
        <SkeletonCard height={140} />
      </div>
    </div>
  )
}
