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
        kind='routes'
        description='Kelola dan pantau informasi rute layanan Transjakarta.'
        title='Routes'
      />
    ),
  },
  {
    path: '/trips',
    element: (
      <SectionPage
        kind='trips'
        description='Pantau perjalanan dan status operasional setiap trip.'
        title='Trips'
      />
    ),
  },
  {
    path: '/map-views',
    element: <App initialView='map' />,
  },
  {
    path: '*',
    element: <Navigate replace to='/vehicle' />,
  },
]);
