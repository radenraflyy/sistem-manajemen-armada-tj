import { type ReactNode, Suspense, lazy } from 'react';

import { Navigate, createBrowserRouter } from 'react-router';

import PageLoading from './components/PageLoading';
import AppLayout from './layouts/AppLayout';

const VehiclesPage = lazy(() => import('./pages/VehiclesPage'));
const RoutesPage = lazy(() => import('./pages/RoutesPage'));
const TripsPage = lazy(() => import('./pages/TripsPage'));

const withPageLoading = (page: ReactNode) => <Suspense fallback={<PageLoading />}>{page}</Suspense>;

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate replace to='/vehicle' />,
  },
  {
    element: <AppLayout />,
    children: [
      {
        path: '/vehicle',
        element: withPageLoading(<VehiclesPage />),
      },
      {
        path: '/routes',
        element: withPageLoading(<RoutesPage />),
      },
      {
        path: '/trips',
        element: withPageLoading(<TripsPage />),
      },
    ],
  },
  {
    path: '*',
    element: <Navigate replace to='/vehicle' />,
  },
]);
