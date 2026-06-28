export function LoadingSkeleton() {
  return (
    <div className="w-full flex flex-col gap-8 animate-pulse pt-2">
      
      {/* Polling Place Header Skeleton */}
      <div className="flex justify-between items-end mb-2">
        <div className="h-8 md:h-10 bg-slate-300/40 rounded w-2/3 md:w-1/3"></div>
      </div>

      {/* Polling Place Card Skeleton */}
      <div className="bg-white p-6 md:p-8 flex flex-col md:flex-row gap-6 relative border-4 border-slate-200">
        <div className="w-full md:w-1/2 flex flex-col gap-4">
          <div className="h-4 bg-slate-300/40 rounded w-1/4"></div>
          <div className="h-10 bg-slate-300/40 rounded w-3/4"></div>
          <div className="h-5 bg-slate-300/40 rounded w-full"></div>
          <div className="h-5 bg-slate-300/40 rounded w-2/3"></div>
          
          <div className="flex gap-4 mt-6">
            <div className="h-10 bg-slate-300/40 rounded w-32"></div>
            <div className="h-10 bg-slate-300/40 rounded w-32"></div>
          </div>
        </div>
        {/* Map Placeholder Skeleton */}
        <div className="w-full md:w-1/2 h-64 md:h-auto bg-slate-200/50 border-2 border-slate-100 rounded-lg"></div>
      </div>

      {/* Ballot Header Skeleton */}
      <div className="h-8 md:h-10 bg-slate-300/40 rounded w-1/2 md:w-1/4 mt-8"></div>

      {/* Candidates Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex flex-col p-4 md:p-6 bg-white border-2 border-slate-200 relative">
               <div className="flex gap-4 md:gap-6 items-start">
                  <div className="w-24 h-24 md:w-32 md:h-32 bg-slate-200/60 shrink-0 border-2 border-slate-100"></div>
                  <div className="flex-1 flex flex-col gap-3 justify-center h-24 md:h-32">
                     <div className="h-4 bg-slate-300/40 rounded w-1/4"></div>
                     <div className="h-8 bg-slate-300/40 rounded w-4/5"></div>
                     <div className="h-4 bg-slate-300/40 rounded w-1/2"></div>
                  </div>
               </div>
            </div>
         ))}
      </div>
    </div>
  );
}
