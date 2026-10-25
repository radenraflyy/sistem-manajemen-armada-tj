type LogoBrandProps = {
  title: string;
  subtitle?: string;
  size?: 'header' | 'footer';
};

const LogoBrand = ({ title, subtitle, size = 'header' }: LogoBrandProps) => (
  <span className='inline-flex items-center gap-3'>
    <img
      alt=''
      aria-hidden='true'
      className={`${size === 'header' ? 'size-16' : 'size-10'} object-contain`}
      src='/icon-tj-brand.png'
    />
    <span className='grid'>
      <strong
        className={size === 'header' ? 'text-base font-bold tracking-tight' : 'text-sm font-bold'}
      >
        {title}
      </strong>
      {subtitle && (
        <span className={size === 'header' ? 'text-xs text-white/70' : 'text-xs text-white/70'}>
          {subtitle}
        </span>
      )}
    </span>
  </span>
);

export default LogoBrand;
