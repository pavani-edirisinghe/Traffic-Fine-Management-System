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
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
        Overview
      </Typography>

      {/* High-Level Metrics (KPI Cards) */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
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
      <Typography variant="h6" sx={{ mb: 2 }}>Recent Transactions</Typography>
      <Box sx={{ height: 400, width: '100%', backgroundColor: 'white' }}>
        <DataGrid
          rows={mockFines}
          columns={columns}
          getRowId={(row) => row.referenceNumber} // Tells MUI to use your reference number as the unique ID
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