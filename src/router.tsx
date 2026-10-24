import { createBrowserRouter, Navigate } from 'react-router';

import App from './App';
import SectionPage from './components/SectionPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate replace to='/vehicle' />,
  },
  {
    path: '/vehicle',
    element: <App />,
  },
  {
    path: '/routes',
    element: (
      <SectionPage
        description='Kelola dan pantau informasi rute layanan Transjakarta.'
        title='Routes'
      />
    ),
  },
  {
    path: '/trips',
    element: (
      <SectionPage
        description='Pantau perjalanan dan status operasional setiap trip.'
        title='Trips'
      />
    ),
  },
  {
    path: '/map-views',
    element: (
      <SectionPage
        description='Lihat posisi armada dan cakupan layanan pada peta.'
        title='Map Views'
      />
    ),
  },
  {
    path: '*',
    element: (
      <SectionPage
        description='Halaman yang Anda cari tidak tersedia.'
        title='404 — Page not found'
      />
    ),
  },
]);
