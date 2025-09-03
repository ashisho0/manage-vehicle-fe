import React from 'react';
import LogCheckerPage from '../pages/LogCheckerPage';

// Route components
const DashboardPage = () => <div className="p-8 text-center">Dashboard Page (Coming Soon)</div>;
const ReportsPage = () => <div className="p-8 text-center">Reports Page (Coming Soon)</div>;
const SettingsPage = () => <div className="p-8 text-center">Settings Page (Coming Soon)</div>;
const DriversPage = () => <div className="p-8 text-center">Drivers Management (Coming Soon)</div>;
const NotFoundPage = () => <div className="p-8 text-center">404 - Page Not Found</div>;

// Routes configuration
export const routes = [
  {
    path: '/',
    element: <LogCheckerPage />,
    title: 'Log Checker'
  },
  {
    path: '/log-checker',
    element: <LogCheckerPage />,
    title: 'Log Checker'
  },
  {
    path: '/dashboard',
    element: <DashboardPage />,
    title: 'Dashboard'
  },
  {
    path: '/reports',
    element: <ReportsPage />,
    title: 'Reports'
  },
  {
    path: '/settings',
    element: <SettingsPage />,
    title: 'Settings'
  },
  {
    path: '/drivers',
    element: <DriversPage />,
    title: 'Drivers'
  },
  {
    path: '*',
    element: <NotFoundPage />,
    title: 'Not Found'
  }
];

export default routes;
