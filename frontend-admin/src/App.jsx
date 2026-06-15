import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline } from '@mui/material';

import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Login from './pages/Login';
import DriverPortal from './pages/DriverPortal';
import OfficerPortal from './pages/OfficerPortal';
import Transactions from './pages/Transactions';
import ManageOfficers from './pages/ManageOfficers';

import { getAuth } from './services/auth';

function normalizeRole(role) {
  if (!role) return '';

  return role.replace('ROLE_', '').toUpperCase();
}

function RequireRole({ allowedRoles, children }) {
  const auth = getAuth();

  if (!auth?.accessToken || !auth?.role) {
    return <Navigate to="/login" replace />;
  }

  const userRole = normalizeRole(auth.role);
  const normalizedAllowedRoles = allowedRoles.map((role) => normalizeRole(role));

  if (!normalizedAllowedRoles.includes(userRole)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <CssBaseline />

      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />

        <Route
          path="/driver"
          element={
            <RequireRole allowedRoles={['DRIVER']}>
              <DriverPortal />
            </RequireRole>
          }
        />

        <Route
          path="/officer"
          element={
            <RequireRole allowedRoles={['OFFICER', 'ADMIN']}>
              <OfficerPortal />
            </RequireRole>
          }
        />

        <Route
          path="/admin"
          element={
            <RequireRole allowedRoles={['ADMIN']}>
              <Layout />
            </RequireRole>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="officers" element={<ManageOfficers />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}