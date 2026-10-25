type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

const EmptyState = ({ title, description, actionLabel, onAction }: EmptyStateProps) => (
  <div className='mt-4 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center'>
    <p className='font-semibold text-slate-700'>{title}</p>
    <p className='mt-1 text-sm text-slate-500'>{description}</p>
    {actionLabel && onAction && (
      <button
        className='mt-4 rounded-lg bg-tj-blue px-4 py-2 text-sm font-semibold text-white transition active:scale-[0.98]'
        onClick={onAction}
        type='button'
      >
        {actionLabel}
      </button>
    )}
  </div>
);

export default EmptyState;
