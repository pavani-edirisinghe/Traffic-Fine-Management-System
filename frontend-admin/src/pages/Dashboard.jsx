import { useEffect, useState, useMemo } from 'react';
import { Box, Grid, Card, CardContent, Typography, Divider, CircularProgress } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// IMPORT LIVE API FUNCTIONS
import { getDrivers, getOfficers, getAllFines } from '../services/api';

export default function Dashboard() {
  const [officers, setOfficers] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);

  // FETCH DATA ON MOUNT
  useEffect(() => {
    const loadAccounts = async () => {
      try {
        setLoading(true);
        const [officerData, driverData, finesData] = await Promise.all([
          getOfficers(), 
          getDrivers(),
          getAllFines() 
        ]);
        
        setOfficers(officerData || []);
        setDrivers(driverData || []);
        setFines(finesData || []);
      } catch (error) {
        console.error("Dashboard data load failed:", error);
        setOfficers([]);
        setDrivers([]);
        setFines([]);
      } finally {
        setLoading(false);
      }
    };

    loadAccounts();
  }, []);

  // ─── CALCULATIONS FOR METRICS & CHARTS ───
  const totalRevenue = fines
    .filter(fine => fine.status === 'PAID')
    .reduce((sum, fine) => sum + (Number(fine.amount) || 0), 0);
    
  const pendingCount = fines.filter(fine => fine.status === 'PENDING').length;
  const totalFines = fines.length;

  // UPDATED: Now groups revenue using the new driverDistrict field
  const districtData = Object.values(fines.reduce((acc, fine) => {
    if (fine.status === 'PAID') {
      const dist = fine.driverDistrict || fine.district || 'Unknown';
      if (!acc[dist]) acc[dist] = { name: dist, revenue: 0 };
      acc[dist].revenue += Number(fine.amount) || 0;
    }
    return acc;
  }, {}));

  const categoryData = Object.values(fines.reduce((acc, fine) => {
    const cat = fine.categoryName || 'Other';
    if (!acc[cat]) acc[cat] = { name: cat, count: 0 };
    acc[cat].count += 1;
    return acc;
  }, {}));

  const COLORS = ['#1976d2', '#2e7d32', '#ed6c02', '#d32f2f'];

  // ─── INTELLIGENT METADATA EXTRACTION ───
  // Scans all fines to build a map of { phoneNumber: { license, district } }
  const driverMetadataMap = useMemo(() => {
    const map = {};
    fines.forEach(fine => {
      const phone = fine.driverPhone || fine.phoneNumber || fine.driver?.phoneNumber;
      const license = fine.driverLicense || fine.licenseNumber || fine.driver?.driverLicense;
      const district = fine.driverDistrict || fine.district; // Captures the newly added district
      
      if (phone) {
        const cleanPhone = phone.replace('driver:', '');
        if (!map[cleanPhone]) map[cleanPhone] = {};
        if (license) map[cleanPhone].license = license;
        if (district) map[cleanPhone].district = district;
      }
    });
    return map;
  }, [fines]);


  // ─── TABLE COLUMN DEFINITIONS ───
  
  // 1. Transactions Table
  const columns = [
    { field: 'referenceNumber', headerName: 'Reference No.', width: 160 },
    { 
      field: 'driverLicense', 
      headerName: 'License No.', 
      width: 150,
      renderCell: (params) => {
        return params.row.driverLicense || 
               params.row.licenseNumber || 
               params.row.driver?.username || 
               params.row.driver?.driverLicense || 
               'N/A';
      }
    },
    { field: 'categoryName', headerName: 'Violation', width: 180 },
    { 
      field: 'district', 
      headerName: 'District', 
      width: 130,
      renderCell: (params) => params.row.driverDistrict || params.row.district || 'N/A'
    },
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

  // 2. Officers Table
  const officerColumns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'username', headerName: 'Username', flex: 1, minWidth: 160 },
    { 
      field: 'name', 
      headerName: 'Name', 
      flex: 1, 
      minWidth: 160,
      renderCell: (params) => params.row.fullName || params.row.displayName || 'N/A'
    },
    { field: 'phoneNumber', headerName: 'Phone', width: 140 },
  ];

  // 3. Drivers Table
  const driverColumns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { 
      field: 'licenseNumber', 
      headerName: 'Driver License', 
      flex: 1, 
      minWidth: 160,
      renderCell: (params) => {
        if (params.row.driverLicense) return params.row.driverLicense;
        if (params.row.licenseNumber) return params.row.licenseNumber;
        if (params.row.nic) return params.row.nic;

        const cleanPhone = (params.row.phoneNumber || '').replace('driver:', '');
        if (cleanPhone && driverMetadataMap[cleanPhone]?.license) {
          return driverMetadataMap[cleanPhone].license;
        }
        return 'N/A';
      }
    },
    { 
      field: 'name', 
      headerName: 'Name', 
      flex: 1, 
      minWidth: 140,
      renderCell: (params) => params.row.fullName || params.row.displayName || params.row.name || 'N/A'
    },
    { field: 'phoneNumber', headerName: 'Phone', width: 130 },
    // ADDED NEW DISTRICT COLUMN
    { 
      field: 'district', 
      headerName: 'District', 
      width: 130,
      renderCell: (params) => {
        if (params.row.district) return params.row.district;

        const cleanPhone = (params.row.phoneNumber || '').replace('driver:', '');
        if (cleanPhone && driverMetadataMap[cleanPhone]?.district) {
          return driverMetadataMap[cleanPhone].district;
        }
        return 'N/A';
      }
    }
  ];

  // ─── RENDER ───
  if (loading) {
    return (
      <Box sx={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', flexShrink: 0 }}>
        Overview
      </Typography>

      {/* KPI Cards */}
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
        <Grid item xs={12} md={7}>
          <Card elevation={2} sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 350 }}>
            <Typography variant="h6" align="center" sx={{ mb: 2 }}>District-Wise Revenue</Typography>
            <Box sx={{ flexGrow: 1, minHeight: 0, minWidth: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={districtData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value) => `Rs. ${value.toLocaleString()}`} />
                  <Bar dataKey="revenue" fill="#1976d2" radius={[4, 4, 0, 0]} maxBarSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>

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
          rows={fines}
          columns={columns}
          getRowId={(row) => row.id || row.referenceNumber}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
        />
      </Box>

      {/* Account Overview Tables */}
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
                    rows={officers.map((officer, index) => ({ 
                      ...officer, 
                      id: officer.id || officer.username || `officer-${index}` 
                    }))}
                    columns={officerColumns}
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
                    rows={drivers.map((driver, index) => ({ 
                      ...driver, 
                      id: driver.id || driver.username || `driver-${index}` 
                    }))}
                    columns={driverColumns}
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