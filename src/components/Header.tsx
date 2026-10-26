import { Link, NavLink } from 'react-router';

import LogoBrand from '@/components/LogoBrand';

const navigationItems = [
  { label: 'Kendaraan', to: '/vehicle' },
  { label: 'Rute', to: '/routes' },
  { label: 'Trip', to: '/trips' },
];

const Header = () => {
  return (
    <header className='col-span-full bg-tj-navy text-white shadow-sm'>
      <div className='mx-auto flex min-h-19 max-w-[1600px] flex-wrap items-center justify-between gap-3 px-5 py-3 sm:px-8 lg:px-10'>
        <Link
          aria-label='Transjakarta - Beranda'
          className='inline-flex items-center gap-3'
          to='/vehicle'
        >
          <LogoBrand title='Transjakarta' subtitle='Sistem Manajemen Armada' />
        </Link>
        <nav aria-label='Navigasi utama' className='flex flex-wrap items-center gap-1'>
          {navigationItems.map(({ label, to }) => (
            <NavLink
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-white/15 text-white'
                    : 'text-white/75 hover:bg-white/10 hover:text-white'
                }`
              }
              key={to}
              to={to}
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;
