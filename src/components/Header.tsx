import { Link, NavLink } from 'react-router';

const Header = () => {
  const links = [
    { label: 'Vehicle', to: '/vehicle' },
    { label: 'Routes', to: '/routes' },
    { label: 'Trips', to: '/trips' },
    { label: 'Map Views', to: '/map-views' },
  ];

  return (
    <header className='col-span-full bg-tj-navy text-white shadow-sm'>
      <div className='mx-auto grid min-h-19 max-w-[1600px] grid-cols-1 items-center gap-3 px-5 py-3 sm:grid-cols-[1fr_auto_1fr] sm:gap-4 sm:px-8 lg:px-10'>
        <Link
          aria-label='Transjakarta - Beranda'
          className='inline-flex items-center gap-3'
          to='/vehicle'
        >
          <img alt='' className='size-16 object-contain' src='/icon-tj.png' />
          <span className='grid'>
            <strong className='text-base font-bold tracking-tight'>Transjakarta</strong>
            <span className='text-xs text-white/70'>Sistem Manajemen Armada</span>
          </span>
        </Link>

        <nav
          aria-label='Navigasi utama'
          className='flex w-full justify-center gap-1 overflow-x-auto sm:w-auto sm:gap-2 sm:justify-self-center'
        >
          {links.map(({ label, to }) => (
            <NavLink
              className={({ isActive }) =>
                `whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition hover:bg-white/10 ${
                  isActive ? 'bg-white/10 text-white' : 'text-white/80'
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
