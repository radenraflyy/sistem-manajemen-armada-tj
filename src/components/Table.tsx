import type { ReactNode } from 'react';

type TableProps = {
  children: ReactNode;
  minWidthClass?: string;
  className?: string;
};

const Table = ({ children, minWidthClass = 'min-w-full', className = '' }: TableProps) => (
  <div
    className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}
  >
    <div className='overflow-x-auto'>
      <table className={`w-full ${minWidthClass} border-collapse text-left text-sm`}>
        {children}
      </table>
    </div>
  </div>
);

export default Table;
