import { Outlet } from 'react-router';

import Footer from '../components/Footer';
import Header from '../components/Header';

const AppLayout = () => (
  <div className='flex min-h-screen flex-col bg-[#f4f7fb] font-pt-sans text-slate-800 antialiased'>
    <Header />
    <Outlet />
    <Footer />
  </div>
);

export default AppLayout;
