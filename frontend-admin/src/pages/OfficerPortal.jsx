import { useState } from 'react';
import { 
  Box, Card, CardContent, Typography, Chip, Grid, Paper, Alert, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Button 
} from '@mui/material';
import PolicyIcon from '@mui/icons-material/Policy';
import LocalPoliceIcon from '@mui/icons-material/LocalPolice';
import AddIcon from '@mui/icons-material/Add';
import { useLocation, Navigate, useNavigate } from 'react-router-dom';
import { mockFines } from '../data/mockData';

export default function OfficerPortal() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentOfficer = location.state?.currentOfficer;

  // Manage fines in local state
  const [fines] = useState(mockFines);

  // Security Check
  if (!currentOfficer) {
    return <Navigate to="/login" replace />;
  }

  // Filter fines
  const officerFines = fines.filter(fine => fine.officerId === currentOfficer.id);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const handleGoToIssueTicket = () => {
    // Navigate to the new page, and pass the officer data along!
    navigate('/issue-ticket', { state: { currentOfficer } });
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc', p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Box sx={{ width: '100%', maxWidth: 1000 }}>
        
        {/* Header Area */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ backgroundColor: '#1976d2', color: 'white', p: 1.5, borderRadius: 2, mr: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LocalPoliceIcon fontSize="large" />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight="bold">Welcome, {currentOfficer.name}</Typography>
              <Typography variant="body2" color="textSecondary">Badge: {currentOfficer.id} • {currentOfficer.district} District</Typography>
            </Box>
          </Box>

          {/* This button now navigates to the new page */}
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={handleGoToIssueTicket}
            sx={{ fontWeight: 'bold', py: 1.5, px: 3, borderRadius: 2, boxShadow: 3 }}
          >
            Issue New Ticket
          </Button>
        </Box>

        {/* KPI Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6}>
            <Card elevation={3} sx={{ borderRadius: 3, borderLeft: '6px solid #2e7d32' }}>
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary" textTransform="uppercase" gutterBottom>Cleared to Return License</Typography>
                <Typography variant="h3" color="success.main" fontWeight="bold">{officerFines.filter(f => f.status === 'PAID').length}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Card elevation={3} sx={{ borderRadius: 3, borderLeft: '6px solid #ed6c02' }}>
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary" textTransform="uppercase" gutterBottom>Pending Payments</Typography>
                <Typography variant="h3" color="warning.main" fontWeight="bold">{officerFines.filter(f => f.status === 'PENDING').length}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tickets Data Table */}
        <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 3, overflow: 'hidden', mb: 4 }}>
          <Box sx={{ backgroundColor: '#1e293b', color: 'white', p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <PolicyIcon fontSize="small" /> 
            <Typography variant="h6" fontWeight="medium">Your Issued Tickets</Typography>
          </Box>
          
          {officerFines.length === 0 ? (
             <Alert severity="info" sx={{ m: 2 }}>You have not issued any tickets yet.</Alert>
          ) : (
            <Box sx={{ width: '100%', backgroundColor: 'white', overflowX: 'auto' }}>
              <Table sx={{ minWidth: 800 }} aria-label="officer tickets table">
                <TableHead sx={{ backgroundColor: '#f1f5f9' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Reference No.</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Vehicle No.</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>License No.</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Violation</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Amount</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Date Issued</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {officerFines.map((row) => (
                    <TableRow key={row.referenceNumber} sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { backgroundColor: '#f8fafc' } }}>
                      <TableCell component="th" scope="row" sx={{ fontWeight: 'medium' }}>{row.referenceNumber}</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#0f172a' }}>{row.vehicleNumber || 'N/A'}</TableCell>
                      <TableCell sx={{ fontWeight: 'medium', color: '#475569' }}>{row.driverLicense || 'N/A'}</TableCell>
                      <TableCell>{row.categoryName}</TableCell>
                      <TableCell><Typography variant="body2" fontWeight="medium">Rs. {row.amount.toLocaleString()}</Typography></TableCell>
                      <TableCell>
                        <Chip label={row.status} color={row.status === 'PAID' ? 'success' : 'warning'} size="small" sx={{ fontWeight: 'bold', borderRadius: 1.5 }} />
                      </TableCell>
                      <TableCell sx={{ color: '#64748b', fontSize: '0.875rem' }}>{formatDate(row.dateIssued)}</TableCell>
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