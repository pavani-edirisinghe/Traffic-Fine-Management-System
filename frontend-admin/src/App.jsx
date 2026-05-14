import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline } from '@mui/material'; 
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Login from './pages/Login';
import Signup from './pages/Signup';
import DriverPortal from './pages/DriverPortal';
import OfficerPortal from './pages/OfficerPortal';
import IssueTicket from './pages/IssueTicket';
import Transactions from './pages/Transactions';
import ManageOfficers from './pages/ManageOfficers';
import { getAuth } from './services/auth';

function RequireRole({ allowedRoles, children }) {
  const auth = getAuth();
  if (!auth?.accessToken || !auth?.role) {
    return <Navigate to="/login" replace />;
  }
  if (!allowedRoles.includes(auth.role)) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      {/* 2. Place it here so it applies to the Login page AND the admin layout */}
      <CssBaseline /> 
      
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/driver" element={
          <RequireRole allowedRoles={["DRIVER"]}>
            <DriverPortal />
          </RequireRole>
        } />
        <Route path="/officer" element={
          <RequireRole allowedRoles={["OFFICER", "ADMIN"]}>
            <OfficerPortal />
          </RequireRole>
        } />
        <Route path="/admin" element={
          <RequireRole allowedRoles={["ADMIN"]}>
            <Layout />
          </RequireRole>
        }>
          <Route index element={<Dashboard />} />
          <Route path="analytics" element={<Analytics />} /> 
          <Route path="transactions" element={<Transactions />} />
          <Route path="officers" element={<ManageOfficers />} />
        </Route>
        <Route path="/issue-ticket" element={
          <RequireRole allowedRoles={["OFFICER", "ADMIN"]}>
            <IssueTicket />
          </RequireRole>
        } />
      </Routes>
    </BrowserRouter>
  );
}