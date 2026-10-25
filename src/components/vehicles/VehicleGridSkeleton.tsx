const VehicleCardSkeleton = () => (
  <article
    aria-hidden='true'
    className='min-h-67.5 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_2px_8px_rgb(15_23_42/4%)] sm:p-5'
  >
    <div className='flex items-start justify-between gap-3'>
      <div className='flex items-center gap-2.5'>
        <div className='skeleton-shimmer h-7 w-10 rounded-md' />
        <div className='skeleton-shimmer h-5 w-20 rounded' />
      </div>
      <div className='skeleton-shimmer h-7 w-20 rounded-md' />
    </div>
    <div className='mt-5 space-y-2'>
      <div className='skeleton-shimmer h-3 w-4/5 rounded' />
      <div className='skeleton-shimmer h-3 w-3/5 rounded' />
    </div>
    <div className='mt-6 flex items-center justify-between'>
      <div className='skeleton-shimmer h-3 w-16 rounded' />
      <div className='skeleton-shimmer h-3 w-28 rounded' />
    </div>
    <div className='mt-4 grid grid-cols-3 gap-2 rounded-xl bg-slate-100 px-3 py-4'>
      <div className='skeleton-shimmer h-8 rounded' />
      <div className='skeleton-shimmer h-8 rounded' />
      <div className='skeleton-shimmer h-8 rounded' />
    </div>
    <div className='mt-5 flex items-center justify-between'>
      <div className='skeleton-shimmer h-3 w-28 rounded' />
      <div className='skeleton-shimmer h-9 w-16 rounded-lg' />
    </div>
  </article>
);

const VehicleGridSkeleton = ({ count = 5 }: { count?: number }) => (
  <section
    aria-label='Memuat kartu armada'
    aria-busy='true'
    className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3'
  >
    {Array.from({ length: count }, (_, index) => (
      <VehicleCardSkeleton key={index} />
    ))}
  </section>
);

export default VehicleGridSkeleton;
