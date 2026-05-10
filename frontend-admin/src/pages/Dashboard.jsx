import { Box, Grid, Card, CardContent, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { mockFines } from '../data/mockData';

export default function Dashboard() {
  // 1. Calculate KPI Metrics dynamically from the data contract
  const totalRevenue = mockFines
    .filter(fine => fine.status === 'PAID')
    .reduce((sum, fine) => sum + fine.amount, 0);

  const pendingCount = mockFines.filter(fine => fine.status === 'PENDING').length;
  const totalFines = mockFines.length;

  // 2. Define the Columns for the DataGrid
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
        <span style={{ 
          color: params.value === 'PAID' ? 'green' : 'red',
          fontWeight: 'bold' 
        }}>
          {params.value}
        </span>
      )
    },
  ];

  return (
    // 1. Lock the total height to the viewport (100vh) minus the Topbar and padding (~100px)
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)' }}>
      
      {/* flexShrink: 0 prevents the browser from squishing the title or cards to make room for the table */}
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', flexShrink: 0 }}>
        Overview
      </Typography>

      {/* High-Level Metrics (KPI Cards) */}
      <Grid container spacing={3} sx={{ mb: 4, flexShrink: 0 }}>
        <Grid item xs={12} sm={4}>
          <Card elevation={3}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Total Fines Issued</Typography>
              <Typography variant="h5">{totalFines}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card elevation={3}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Total Revenue (LKR)</Typography>
              <Typography variant="h5" color="success.main">Rs. {totalRevenue.toLocaleString()}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card elevation={3}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Pending Payments</Typography>
              <Typography variant="h5" color="error.main">{pendingCount}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Live Transaction Feed */}
      <Typography variant="h6" sx={{ mb: 2, flexShrink: 0 }}>Recent Transactions</Typography>
      
      {/* 2. flexGrow: 1 tells this wrapper to consume all remaining vertical space. minHeight: 0 prevents overflow bugs. */}
      <Box sx={{ flexGrow: 1, width: '100%', backgroundColor: 'white', minHeight: 0 }}>
        <DataGrid
          rows={mockFines}
          columns={columns}
          getRowId={(row) => row.referenceNumber}
          initialState={{
            pagination: { paginationModel: { pageSize: 5 } },
          }}
          pageSizeOptions={[5, 10, 25]}
          disableRowSelectionOnClick
        />
      </Box>
    </Box>
  );
}