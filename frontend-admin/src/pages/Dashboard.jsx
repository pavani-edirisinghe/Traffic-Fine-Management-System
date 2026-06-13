import { useEffect, useState } from 'react';
import { Box, Grid, Card, CardContent, Typography, Divider } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { mockFines } from '../data/mockData';
import { getDrivers, getOfficers } from '../services/api';

export default function Dashboard() {
  const [officers, setOfficers] = useState([]);
  const [drivers, setDrivers] = useState([]);

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const [officerData, driverData] = await Promise.all([getOfficers(), getDrivers()]);
        setOfficers(officerData);
        setDrivers(driverData);
      } catch {
        setOfficers([]);
        setDrivers([]);
      }
    };

    loadAccounts();
  }, []);

  // 1. Calculate KPI Metrics
  const totalRevenue = mockFines
    .filter(fine => fine.status === 'PAID')
    .reduce((sum, fine) => sum + fine.amount, 0);
  const pendingCount = mockFines.filter(fine => fine.status === 'PENDING').length;
  const totalFines = mockFines.length;

  // 2. Transform Data for District Revenue (Bar Chart)
  // We only calculate 'PAID' fines for revenue.
  const districtData = Object.values(mockFines.reduce((acc, fine) => {
    if (fine.status === 'PAID') {
      if (!acc[fine.district]) acc[fine.district] = { name: fine.district, revenue: 0 };
      acc[fine.district].revenue += fine.amount;
    }
    return acc;
  }, {}));

  // 3. Transform Data for Category Breakdown (Pie Chart)
  const categoryData = Object.values(mockFines.reduce((acc, fine) => {
    if (!acc[fine.categoryName]) acc[fine.categoryName] = { name: fine.categoryName, count: 0 };
    acc[fine.categoryName].count += 1;
    return acc;
  }, {}));

  const COLORS = ['#1976d2', '#2e7d32', '#ed6c02', '#d32f2f'];

  const columns = [
    { field: 'referenceNumber', headerName: 'Reference No.', width: 160 },
    { field: 'categoryName', headerName: 'Violation', width: 200 },
    { field: 'district', headerName: 'District', width: 130 },
    { field: 'amount', headerName: 'Amount (LKR)', width: 130, type: 'number' },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 120,
      renderCell: (params) => (
        <span style={{ color: params.value === 'PAID' ? 'green' : 'red', fontWeight: 'bold' }}>
          {params.value}
        </span>
      )
    },
  ];

  const accountColumns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'username', headerName: 'Username', flex: 1, minWidth: 180 },
    { field: 'displayName', headerName: 'Name', flex: 1, minWidth: 160 },
    { field: 'phoneNumber', headerName: 'Phone', width: 140 },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', flexShrink: 0 }}>
        Overview
      </Typography>

      {/* High-Level Metrics (KPI Cards) */}
      <Grid container spacing={3} sx={{ mb: 3, flexShrink: 0 }}>
        <Grid item xs={12} sm={4}>
          <Card elevation={2}><CardContent>
            <Typography color="textSecondary" gutterBottom>Total Fines Issued</Typography>
            <Typography variant="h5">{totalFines}</Typography>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card elevation={2}><CardContent>
            <Typography color="textSecondary" gutterBottom>Total Revenue (LKR)</Typography>
            <Typography variant="h5" color="success.main">Rs. {totalRevenue.toLocaleString()}</Typography>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card elevation={2}><CardContent>
            <Typography color="textSecondary" gutterBottom>Pending Payments</Typography>
            <Typography variant="h5" color="error.main">{pendingCount}</Typography>
          </CardContent></Card>
        </Grid>
      </Grid>

      {/* Analytics Charts */}
      <Grid container spacing={3} sx={{ mb: 3, flexShrink: 0 }}>
        
        {/* District Revenue Chart */}
        {/* FIX 1: Use md={7} to give it proper space on laptop screens */}
        <Grid item xs={12} md={7}>
          <Card elevation={2} sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 350 }}>
            {/* FIX 2: align="center" anchors the title visually */}
            <Typography variant="h6" align="center" sx={{ mb: 2 }}>District-Wise Revenue</Typography>
            
            <Box sx={{ flexGrow: 1, minHeight: 0, minWidth: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={districtData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value) => `Rs. ${value.toLocaleString()}`} />
                  {/* FIX 3: Changed barSize to maxBarSize. This lets Recharts dynamically center and scale the bars based on available space */}
                  <Bar dataKey="revenue" fill="#1976d2" radius={[4, 4, 0, 0]} maxBarSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>

        {/* Category Breakdown Chart */}
        {/* FIX 4: Use md={5} to balance the 12-column grid */}
        <Grid item xs={12} md={5}>
          <Card elevation={2} sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 350 }}>
            <Typography variant="h6" align="center" sx={{ mb: 2 }}>Fine Categories</Typography>
            
            <Box sx={{ flexGrow: 1, minHeight: 0, minWidth: 0, display: 'flex', justifyContent: 'center' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={categoryData} 
                    cx="50%" 
                    cy="50%" 
                    /* FIX 5: Switched hard pixel values to percentages. The pie will now flawlessly scale up or down without ever clipping */
                    innerRadius="50%" 
                    outerRadius="80%" 
                    paddingAngle={5} 
                    dataKey="count"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: '14px', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>
        
      </Grid>

      {/* Live Transaction Feed */}
      <Typography variant="h6" sx={{ mb: 2, flexShrink: 0 }}>Recent Transactions</Typography>
      <Box sx={{ flexGrow: 1, width: '100%', backgroundColor: 'white', minHeight: 0, boxShadow: 2, borderRadius: 1 }}>
        <DataGrid
          rows={mockFines}
          columns={columns}
          getRowId={(row) => row.referenceNumber}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
        />
      </Box>

      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>Account Overview</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight="bold">Officers</Typography>
                <Divider sx={{ my: 1.5 }} />
                <Box sx={{ height: 320, width: '100%' }}>
                  <DataGrid
                    rows={officers.map((officer, index) => ({ id: officer.username || index, ...officer }))}
                    columns={accountColumns}
                    disableRowSelectionOnClick
                    pageSizeOptions={[5, 10]}
                    initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight="bold">Drivers</Typography>
                <Divider sx={{ my: 1.5 }} />
                <Box sx={{ height: 320, width: '100%' }}>
                  <DataGrid
                    rows={drivers.map((driver, index) => ({ id: driver.username || index, ...driver }))}
                    columns={accountColumns}
                    disableRowSelectionOnClick
                    pageSizeOptions={[5, 10]}
                    initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}