import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics'; // 1. Import the new page

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* The Layout component wraps all dashboard routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="analytics" element={<Analytics />} /> {/* 2. Add the route */}
          {/* <Route path="transactions" element={<Transactions />} /> We will build this later */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}