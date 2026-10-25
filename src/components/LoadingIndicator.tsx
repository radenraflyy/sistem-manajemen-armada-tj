type LoadingIndicatorProps = {
  label?: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
};

const logoSizes = {
  small: 'size-4',
  medium: 'size-6',
  large: 'size-10',
};

const LoadingIndicator = ({
  label = 'Loading...',
  size = 'medium',
  className = '',
}: LoadingIndicatorProps) => (
  <span
    aria-label={label}
    aria-live='polite'
    className={`inline-flex items-center gap-2 text-xs font-medium text-slate-500 ${className}`}
    role='status'
  >
    <img
      alt=''
      className={`${logoSizes[size]} shrink-0 animate-spin object-contain`}
      src='/tj-logo.png'
    />
    <span>{label}</span>
  </span>
);

export default LoadingIndicator;
