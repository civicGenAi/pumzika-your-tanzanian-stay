export const SkeletonCard = () => (
  <div className="animate-pulse">
    <div className="aspect-[4/3] rounded-2xl animate-shimmer" />
    <div className="mt-3 space-y-2 px-0.5">
      <div className="h-4 w-3/4 rounded animate-shimmer" />
      <div className="h-3 w-1/2 rounded animate-shimmer" />
      <div className="h-4 w-1/3 rounded animate-shimmer" />
    </div>
  </div>
);
