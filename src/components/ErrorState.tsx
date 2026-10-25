type ErrorStateProps = {
  title: string;
  description: string;
  onRetry: () => void;
  retryLabel?: string;
  className?: string;
};

const ErrorState = ({
  title,
  description,
  onRetry,
  retryLabel = 'Coba lagi',
  className = 'px-6 py-16 text-center',
}: ErrorStateProps) => (
  <div className={className} role='alert'>
    <p className='font-semibold text-slate-800'>{title}</p>
    <p className='mt-2 text-sm text-slate-500'>{description}</p>
    <button
      className='mt-4 rounded-lg bg-tj-blue px-4 py-2 text-sm font-semibold text-white transition active:scale-[0.98]'
      onClick={onRetry}
      type='button'
    >
      {retryLabel}
    </button>
  </div>
);

export default ErrorState;
