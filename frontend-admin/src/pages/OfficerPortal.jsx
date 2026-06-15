import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Box, Card, CardContent, Typography, Chip, Grid, Paper, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, TextField, Stack, CircularProgress
} from '@mui/material';
import PolicyIcon from '@mui/icons-material/Policy';
import LocalPoliceIcon from '@mui/icons-material/LocalPolice';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { useLocation, Navigate } from 'react-router-dom';

import { appendOfficerTokenHistory, getOfficerProfile, getOfficerTokenHistory } from '../services/auth';
import { issueDriverToken, getOfficerFines } from '../services/api';
import LogoutButton from '../components/LogoutButton';

const INITIAL_FORM_STATE = {
  driverName: '', phoneNumber: '', wrongDid: '', amount: '', vehicleNumber: '', licenseNumber: ''
};

export default function OfficerPortal() {
  const location = useLocation();
  const currentOfficer = location.state?.currentOfficer || getOfficerProfile();

  const [driverForm, setDriverForm] = useState(INITIAL_FORM_STATE);
  const [generatedToken, setGeneratedToken] = useState(null);
  const [tokenError, setTokenError] = useState('');
  const [issuingToken, setIssuingToken] = useState(false);

  const [officerFines, setOfficerFines] = useState([]);
  const [loadingFines, setLoadingFines] = useState(false);
  const [fineError, setFineError] = useState('');

  // Page Navigation State: 'dashboard' | 'notifications' | 'tickets'
  const [activeView, setActiveView] = useState('dashboard');

  const [tokenHistory, setTokenHistory] = useState(() => getOfficerTokenHistory(currentOfficer?.id));

  const loadOfficerFines = useCallback(async () => {
    if (!currentOfficer) return;
    try {
      setLoadingFines(true);
      setFineError('');
      const data = await getOfficerFines();
      const normalizedFines = Array.isArray(data) ? data.map((fine) => ({
        id: fine.id,
        referenceNumber: fine.referenceNumber || 'N/A',
        vehicleNumber: fine.vehicleNumber || 'N/A',
        driverLicense: fine.driverLicense || fine.licenseNumber || 'N/A',
        categoryName: fine.categoryName || fine.description || fine.wrongDid || 'Traffic Violation',
        amount: Number(fine.amount || 0),
        status: fine.status === 'PAID' ? 'PAID' : fine.status === 'UNPAID' ? 'PENDING' : fine.status || 'PENDING',
        dateIssued: fine.issuedAt || fine.dateIssued || fine.savedAt || null,
        paidAt: fine.paidAt || fine.datePaid || null,
        driverName: fine.driverName || fine.driver?.fullName || 'N/A',
        driverPhone: fine.driverPhone || fine.phoneNumber || fine.driver?.phoneNumber || 'N/A',
      })) : [];
      setOfficerFines(normalizedFines);
    } catch (error) {
      console.error('Error loading officer fines:', error);
      setFineError('Failed to load issued tickets from database.');
    } finally {
      setLoadingFines(false);
    }
  }, [currentOfficer]);

  useEffect(() => {
    loadOfficerFines();
  }, [loadOfficerFines]);

  useEffect(() => {
    const handleStorageChange = () => {
      setTokenHistory(getOfficerTokenHistory(currentOfficer?.id));
      loadOfficerFines();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [currentOfficer?.id, loadOfficerFines]);

  useEffect(() => {
    const handleFocus = () => loadOfficerFines();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [loadOfficerFines]);

  const paidFinesCount = useMemo(() => officerFines.filter((fine) => fine.status === 'PAID').length, [officerFines]);
  const pendingFinesCount = useMemo(() => officerFines.filter((fine) => fine.status !== 'PAID').length, [officerFines]);

  const paymentNotifications = useMemo(() => {
    return officerFines
      .filter((fine) => fine.status === 'PAID')
      .map((fine) => ({
        paidAt: fine.paidAt, driverName: fine.driverName, phoneNumber: fine.driverPhone,
        referenceNumber: fine.referenceNumber, amount: fine.amount, vehicleNumber: fine.vehicleNumber,
        message: `${fine.driverName || 'Driver'} paid Rs. ${Number(fine.amount || 0).toLocaleString()} for ${fine.referenceNumber}`,
      }));
  }, [officerFines]);

  if (!currentOfficer) return <Navigate to="/login" replace />;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  const formatAmount = (value) => `Rs. ${Number(value || 0).toLocaleString()}`;

  const handleDriverFormChange = (e) => {
    const { name, value } = e.target;
    setDriverForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleIssueDriverToken = async (e) => {
    e.preventDefault();
    setIssuingToken(true);
    setTokenError('');
    setGeneratedToken(null);

    try {
      const { driverToken, fine } = await issueDriverToken(driverForm);
      const tokenCode = crypto.randomUUID().replace(/-/g, '').slice(0, 15).toUpperCase();
      const nextRecord = {
        ...driverToken, ...driverForm, fineId: fine?.id, referenceNumber: fine?.referenceNumber,
        tokenCode, officerId: currentOfficer.id, officerName: currentOfficer.name, savedAt: new Date().toISOString(),
      };

      setTokenHistory(appendOfficerTokenHistory(currentOfficer.id, nextRecord));
      setGeneratedToken({ ...driverToken, tokenCode, referenceNumber: fine?.referenceNumber });
      setDriverForm(INITIAL_FORM_STATE);
      await loadOfficerFines();
    } catch (error) {
      setTokenError(error?.response?.data?.message || 'Unable to generate driver token.');
    } finally {
      setIssuingToken(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc', p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Box sx={{ width: '100%', maxWidth: 1000 }}>
        {/* Global Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ backgroundColor: '#1976d2', color: 'white', p: 1.5, borderRadius: 2, mr: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LocalPoliceIcon fontSize="large" />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight="bold">Welcome, {currentOfficer.name}</Typography>
              <Typography variant="body2" color="textSecondary">Officer ID: {currentOfficer.id} • {currentOfficer.district} District</Typography>
            </Box>
          </Box>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
<<<<<<< HEAD
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadOfficerFines} disabled={loadingFines} sx={{ fontWeight: 'bold' }}>Refresh</Button>
=======
           
>>>>>>> 08adce43f956666516f11b7cadb684be7a707499
            <LogoutButton sx={{ color: '#0f172a', borderColor: '#cbd5e1' }} />
          </Stack>
        </Box>

        {fineError && <Alert severity="error" sx={{ mb: 3 }}>{fineError}</Alert>}

        {/* DASHBOARD VIEW */}
        {activeView === 'dashboard' && (
          <>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <Card elevation={3} sx={{ borderRadius: 3, borderLeft: '6px solid #2e7d32' }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="textSecondary" sx={{ textTransform: 'uppercase' }} gutterBottom>Cleared to Return License</Typography>
                    <Typography variant="h3" color="success.main" fontWeight="bold">{paidFinesCount}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card elevation={3} sx={{ borderRadius: 3, borderLeft: '6px solid #ed6c02' }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="textSecondary" sx={{ textTransform: 'uppercase' }} gutterBottom>Pending Payments</Typography>
                    <Typography variant="h3" color="warning.main" fontWeight="bold">{pendingFinesCount}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Navigation Buttons to Tables */}
            <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
              <Button variant="contained" color="success" size="large" startIcon={<NotificationsIcon />} onClick={() => setActiveView('notifications')} sx={{ flex: 1, py: 1.5, borderRadius: 2, fontWeight: 'bold' }}>
                View Payment Notifications
              </Button>
              <Button variant="contained" color="primary" size="large" startIcon={<ReceiptIcon />} onClick={() => setActiveView('tickets')} sx={{ flex: 1, py: 1.5, borderRadius: 2, fontWeight: 'bold', backgroundColor: '#1e293b', '&:hover': { backgroundColor: '#0f172a' } }}>
                View Your Issued Tickets
              </Button>
            </Stack>

            <Card elevation={3} sx={{ mb: 4, borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Generate Driver Token</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Add the driver details and violation, then share the generated token with the driver.</Typography>
                <form onSubmit={handleIssueDriverToken}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}><TextField fullWidth label="Driver Name" name="driverName" value={driverForm.driverName} onChange={handleDriverFormChange} required /></Grid>
                    <Grid item xs={12} md={6}><TextField fullWidth label="Telephone Number" name="phoneNumber" value={driverForm.phoneNumber} onChange={handleDriverFormChange} required /></Grid>
                    <Grid item xs={12} md={6}><TextField fullWidth label="Violation" name="wrongDid" value={driverForm.wrongDid} onChange={handleDriverFormChange} required /></Grid>
                    <Grid item xs={12} md={6}><TextField fullWidth label="Fine Amount" name="amount" type="number" value={driverForm.amount} onChange={handleDriverFormChange} required /></Grid>
                    <Grid item xs={12} md={6}><TextField fullWidth label="Vehicle Number" name="vehicleNumber" value={driverForm.vehicleNumber} onChange={handleDriverFormChange} /></Grid>
                    <Grid item xs={12} md={6}><TextField fullWidth label="License Number" name="licenseNumber" value={driverForm.licenseNumber} onChange={handleDriverFormChange} /></Grid>
                    <Grid item xs={12}>
                      {tokenError && <Alert severity="error" sx={{ mb: 1, mt: 1 }}>{tokenError}</Alert>}
                      <Button type="submit" variant="contained" disabled={issuingToken} sx={{ mt: 1 }}>{issuingToken ? 'Generating...' : 'Generate Driver Token'}</Button>
                    </Grid>
                  </Grid>
                </form>
                {generatedToken && (
                  <Alert severity="success" sx={{ mt: 2, whiteSpace: 'pre-wrap' }}>
                    Token generated for {generatedToken.username}. Share this 15-character token code with the driver:{'\n'}
                    {generatedToken.tokenCode}{'\n'}
                    Reference No: {generatedToken.referenceNumber || 'Check table below'}{'\n'}
                    Officer ID: {currentOfficer.id}
                  </Alert>
                )}
              </CardContent>
            </Card>

            <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 3, overflow: 'hidden', mb: 4 }}>
              <Box sx={{ backgroundColor: '#0f172a', color: 'white', p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h6" fontWeight="medium">Saved Driver Tokens</Typography>
              </Box>
              {tokenHistory.length === 0 ? (
                <Alert severity="info" sx={{ m: 2 }}>No driver tokens have been generated yet.</Alert>
              ) : (
                <Box sx={{ width: '100%', backgroundColor: 'white', overflowX: 'auto' }}>
                  <Table sx={{ minWidth: 1200 }} aria-label="saved driver tokens table">
                    <TableHead sx={{ backgroundColor: '#f1f5f9' }}>
                      <TableRow>
                        {['Issued At', 'Driver Name', 'Phone Number', 'Reference No.', 'Violation', 'Amount', 'Token Code'].map((header) => (
                          <TableCell key={header} sx={{ fontWeight: 'bold', color: '#475569' }}>{header}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {tokenHistory.map((row) => (
                        <TableRow key={`${row.accessToken || row.tokenCode}-${row.savedAt}`} sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { backgroundColor: '#f8fafc' } }}>
                          <TableCell sx={{ color: '#64748b', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>{formatDate(row.savedAt)}</TableCell>
                          <TableCell sx={{ fontWeight: 'medium' }}>{row.driverName || 'N/A'}</TableCell>
                          <TableCell sx={{ color: '#475569' }}>{row.phoneNumber || 'N/A'}</TableCell>
                          <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>{row.referenceNumber || 'N/A'}</TableCell>
                          <TableCell sx={{ maxWidth: 220 }}>{row.wrongDid || 'N/A'}</TableCell>
                          <TableCell><Typography variant="body2" fontWeight="medium">{formatAmount(row.amount)}</Typography></TableCell>
                          <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>{row.tokenCode || 'N/A'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              )}
            </TableContainer>
          </>
        )}

        {/* NOTIFICATIONS PAGE */}
        {activeView === 'notifications' && (
          <Box>
            <Button startIcon={<ArrowBackIcon />} onClick={() => setActiveView('dashboard')} sx={{ mb: 2, fontWeight: 'bold' }}>Back to Dashboard</Button>
            <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 3, overflow: 'hidden', mb: 4 }}>
              <Box sx={{ backgroundColor: '#14532d', color: 'white', p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h6" fontWeight="medium">Payment Notifications</Typography>
              </Box>
              {paymentNotifications.length === 0 ? (
                <Alert severity="info" sx={{ m: 2 }}>No payment notifications yet.</Alert>
              ) : (
                <Box sx={{ width: '100%', backgroundColor: 'white', overflowX: 'auto' }}>
                  <Table sx={{ minWidth: 1000 }} aria-label="officer payment notifications table">
                    <TableHead sx={{ backgroundColor: '#f1f5f9' }}>
                      <TableRow>
                        {['Time Paid', 'Driver Name', 'Phone', 'Reference No.', 'Amount', 'Vehicle No.', 'Message'].map((header) => (
                          <TableCell key={header} sx={{ fontWeight: 'bold', color: '#475569' }}>{header}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paymentNotifications.map((row) => (
                        <TableRow key={`${row.referenceNumber}-${row.paidAt}`} sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { backgroundColor: '#f8fafc' } }}>
                          <TableCell sx={{ color: '#64748b', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>{formatDate(row.paidAt)}</TableCell>
                          <TableCell sx={{ fontWeight: 'medium' }}>{row.driverName || 'N/A'}</TableCell>
                          <TableCell sx={{ color: '#475569' }}>{row.phoneNumber || 'N/A'}</TableCell>
                          <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>{row.referenceNumber || 'N/A'}</TableCell>
                          <TableCell sx={{ fontWeight: 'medium' }}>{formatAmount(row.amount)}</TableCell>
                          <TableCell sx={{ color: '#475569' }}>{row.vehicleNumber || 'N/A'}</TableCell>
                          <TableCell sx={{ maxWidth: 420, whiteSpace: 'normal', wordBreak: 'break-word' }}>{row.message || 'Fine payment received.'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              )}
            </TableContainer>
          </Box>
        )}

        {/* ISSUED TICKETS PAGE */}
        {activeView === 'tickets' && (
          <Box>
            <Button startIcon={<ArrowBackIcon />} onClick={() => setActiveView('dashboard')} sx={{ mb: 2, fontWeight: 'bold' }}>Back to Dashboard</Button>
            <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 3, overflow: 'hidden', mb: 4 }}>
              <Box sx={{ backgroundColor: '#1e293b', color: 'white', p: 2, display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PolicyIcon fontSize="small" />
                  <Typography variant="h6" fontWeight="medium">Your Issued Tickets</Typography>
                </Box>
                {loadingFines && <CircularProgress size={20} color="inherit" />}
              </Box>
              {officerFines.length === 0 ? (
                <Alert severity="info" sx={{ m: 2 }}>You have not issued any tickets yet.</Alert>
              ) : (
                <Box sx={{ width: '100%', backgroundColor: 'white', overflowX: 'auto' }}>
                  <Table sx={{ minWidth: 900 }} aria-label="officer tickets table">
                    <TableHead sx={{ backgroundColor: '#f1f5f9' }}>
                      <TableRow>
                        {['Reference No.', 'Driver', 'Vehicle No.', 'License No.', 'Violation', 'Amount', 'Status', 'Date Issued', 'Paid At'].map((header) => (
                          <TableCell key={header} sx={{ fontWeight: 'bold', color: '#475569' }}>{header}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {officerFines.map((row) => (
                        <TableRow key={row.id || row.referenceNumber} sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { backgroundColor: '#f8fafc' } }}>
                          <TableCell component="th" scope="row" sx={{ fontWeight: 'medium', fontFamily: 'monospace' }}>{row.referenceNumber}</TableCell>
                          <TableCell sx={{ fontWeight: 'medium' }}>{row.driverName || 'N/A'}</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', color: '#0f172a' }}>{row.vehicleNumber || 'N/A'}</TableCell>
                          <TableCell sx={{ fontWeight: 'medium', color: '#475569' }}>{row.driverLicense || 'N/A'}</TableCell>
                          <TableCell>{row.categoryName}</TableCell>
                          <TableCell><Typography variant="body2" fontWeight="medium">{formatAmount(row.amount)}</Typography></TableCell>
                          <TableCell><Chip label={row.status} color={row.status === 'PAID' ? 'success' : 'warning'} size="small" sx={{ fontWeight: 'bold', borderRadius: 1.5 }} /></TableCell>
                          <TableCell sx={{ color: '#64748b', fontSize: '0.875rem' }}>{formatDate(row.dateIssued)}</TableCell>
                          <TableCell sx={{ color: '#64748b', fontSize: '0.875rem' }}>{formatDate(row.paidAt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              )}
            </TableContainer>
          </Box>
        )}

      </Box>
    </Box>
  );
}