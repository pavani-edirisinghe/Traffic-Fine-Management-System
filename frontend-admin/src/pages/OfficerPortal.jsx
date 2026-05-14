import { Box, Card, CardContent, Typography, Chip, Grid, Paper, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import PolicyIcon from '@mui/icons-material/Policy';
import LocalPoliceIcon from '@mui/icons-material/LocalPolice';
import { useLocation, Navigate } from 'react-router-dom';
import { mockFines } from '../data/mockData';

export default function OfficerPortal() {
  const location = useLocation();
  const currentOfficer = location.state?.currentOfficer;

  // Security Check
  if (!currentOfficer) {
    return <Navigate to="/login" replace />;
  }

  // Filter fines for this specific officer
  const officerFines = mockFines.filter(fine => fine.officerId === currentOfficer.id);

  // Helper function to format the date nicely
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8fafc',
      p: 3,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <Box sx={{ width: '100%', maxWidth: 1000 }}>
        
        {/* Official Header Area */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Box sx={{ 
            backgroundColor: '#1976d2', 
            color: 'white', 
            p: 1.5, 
            borderRadius: 2, 
            mr: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <LocalPoliceIcon fontSize="large" />
          </Box>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Welcome, {currentOfficer.name}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Badge: {currentOfficer.id} • {currentOfficer.district} District
            </Typography>
          </Box>
        </Box>

        {/* Quick KPI Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6}>
            <Card elevation={3} sx={{ borderRadius: 3, borderLeft: '6px solid #2e7d32' }}>
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary" textTransform="uppercase" gutterBottom>
                  Cleared to Return License
                </Typography>
                <Typography variant="h3" color="success.main" fontWeight="bold">
                  {officerFines.filter(f => f.status === 'PAID').length}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Fines successfully paid by drivers today
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Card elevation={3} sx={{ borderRadius: 3, borderLeft: '6px solid #ed6c02' }}>
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary" textTransform="uppercase" gutterBottom>
                  Pending Payments
                </Typography>
                <Typography variant="h3" color="warning.main" fontWeight="bold">
                  {officerFines.filter(f => f.status === 'PENDING').length}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Awaiting driver payment to release license
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Native MUI Table Component */}
        <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 3, overflow: 'hidden', mb: 4 }}>
          <Box sx={{ backgroundColor: '#1e293b', color: 'white', p: 2 }}>
            <Typography variant="h6" fontWeight="medium" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PolicyIcon fontSize="small" /> Your Issued Tickets
            </Typography>
          </Box>
          
          {officerFines.length === 0 ? (
             <Alert severity="info" sx={{ m: 2 }}>You have not issued any tickets yet.</Alert>
          ) : (
            <Box sx={{ width: '100%', backgroundColor: 'white', overflowX: 'auto' }}>
              <Table sx={{ minWidth: 650 }} aria-label="officer tickets table">
                
                {/* Table Header */}
                <TableHead sx={{ backgroundColor: '#f1f5f9' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Reference No.</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Violation</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Amount</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Date Issued</TableCell>
                  </TableRow>
                </TableHead>

                {/* Table Body */}
                <TableBody>
                  {officerFines.map((row) => (
                    <TableRow
                      key={row.referenceNumber}
                      sx={{ 
                        '&:last-child td, &:last-child th': { border: 0 },
                        '&:hover': { backgroundColor: '#f8fafc' },
                        transition: 'background-color 0.2s ease'
                      }}
                    >
                      <TableCell component="th" scope="row" sx={{ fontWeight: 'medium' }}>
                        {row.referenceNumber}
                      </TableCell>
                      <TableCell>{row.categoryName}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          Rs. {row.amount.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={row.status} 
                          color={row.status === 'PAID' ? 'success' : 'warning'} 
                          size="small" 
                          sx={{ fontWeight: 'bold', borderRadius: 1.5 }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: '#64748b' }}>
                        {formatDate(row.dateIssued)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}
        </TableContainer>

      </Box>
    </Box>
  );
}