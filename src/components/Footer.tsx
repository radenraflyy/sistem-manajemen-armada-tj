import LogoBrand from './LogoBrand';

const Footer = () => {
  return (
    <footer className='col-span-full bg-tj-blue text-white'>
      <div className='mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-x-8 gap-y-4 px-5 py-6 sm:px-8 lg:px-10'>
        <div className='flex items-center gap-3'>
          <LogoBrand title='PT Transportasi Jakarta' size='footer' />
        </div>

        <div className='text-xs text-white/80'>
          <p className='mt-1'>Sistem Manajemen Armada · Transjakarta</p>
        </div>

        <p className='text-xs text-white/70'>© 2026 PT Transportasi Jakarta</p>
      </div>
    </footer>
  );
};

export default Footer;
