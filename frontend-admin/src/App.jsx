import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline } from '@mui/material'; 
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Login from './pages/Login';
import DriverPortal from './pages/DriverPortal';
import OfficerPortal from './pages/OfficerPortal';
import IssueTicket from './pages/IssueTicket';
import Transactions from './pages/Transactions';
import ManageOfficers from './pages/ManageOfficers';

export default function App() {
  return (
    <BrowserRouter>
      {/* 2. Place it here so it applies to the Login page AND the admin layout */}
      <CssBaseline /> 
      
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/driver" element={<DriverPortal />} />
        <Route path="/officer" element={<OfficerPortal />} />
        <Route path="/admin" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="analytics" element={<Analytics />} /> 
          <Route path="transactions" element={<Transactions />} />
          <Route path="officers" element={<ManageOfficers />} />
        </Route>
        <Route path="/issue-ticket" element={<IssueTicket />} />
      </Routes>
    </BrowserRouter>
  );
}