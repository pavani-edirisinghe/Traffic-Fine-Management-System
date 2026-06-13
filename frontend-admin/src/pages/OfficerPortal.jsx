
import { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  Paper,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  Stack,
} from '@mui/material';
import PolicyIcon from '@mui/icons-material/Policy';
import LocalPoliceIcon from '@mui/icons-material/LocalPolice';
import AddIcon from '@mui/icons-material/Add';
import { useLocation, Navigate, useNavigate } from 'react-router-dom';
import { mockFines } from '../data/mockData';
import {
  appendOfficerTokenHistory,
  getOfficerNotifications,
  getOfficerProfile,
  getOfficerTokenHistory,
} from '../services/auth';
import { issueDriverToken } from '../services/api';
import LogoutButton from '../components/LogoutButton';

const INITIAL_FORM_STATE = {
  driverName: '',
  phoneNumber: '',
  wrongDid: '',
  amount: '',
  vehicleNumber: '',
  licenseNumber: '',
};

export default function OfficerPortal() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentOfficer = location.state?.currentOfficer || getOfficerProfile();

  const [driverForm, setDriverForm] = useState(INITIAL_FORM_STATE);
  const [generatedToken, setGeneratedToken] = useState(null);
  const [tokenError, setTokenError] = useState('');
  const [issuingToken, setIssuingToken] = useState(false);
  const [tokenHistory, setTokenHistory] = useState(() => getOfficerTokenHistory(currentOfficer?.id));
  const [notificationHistory, setNotificationHistory] = useState(() => getOfficerNotifications(currentOfficer?.id));

  const officerFines = useMemo(
    () => mockFines.filter((fine) => fine.officerId === currentOfficer?.id),
    [currentOfficer?.id]
  );

  if (!currentOfficer) {
    return <Navigate to="/login" replace />;
  }

  const formatDate = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const handleGoToIssueTicket = () => {
    navigate('/issue-ticket', { state: { currentOfficer } });
  };

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
      const data = await issueDriverToken(driverForm);
      const tokenCode = crypto.randomUUID().replace(/-/g, '').slice(0, 15).toUpperCase();
      const nextRecord = {
        ...data,
        ...driverForm,
        tokenCode,
        officerId: currentOfficer.id,
        officerName: currentOfficer.name,
        savedAt: new Date().toISOString(),
      };
      setTokenHistory(appendOfficerTokenHistory(currentOfficer.id, nextRecord));
      setGeneratedToken({ ...data, tokenCode });
      setDriverForm(INITIAL_FORM_STATE);
    } catch (error) {
      setTokenError(error?.response?.data?.message || 'Unable to generate driver token.');
    } finally {
      setIssuingToken(false);
    }
  };

  const formatIssuedAt = (value) => {
    if (!value) return 'N/A';
    return new Date(value).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAmount = (value) => `Rs. ${Number(value || 0).toLocaleString()}`;

  useEffect(() => {
    const handleStorageChange = () => {
      setTokenHistory(getOfficerTokenHistory(currentOfficer?.id));
      setNotificationHistory(getOfficerNotifications(currentOfficer?.id));
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [currentOfficer?.id]);

  const paidFinesCount = officerFines.filter((f) => f.status === 'PAID').length;
  const pendingFinesCount = officerFines.filter((f) => f.status === 'PENDING').length;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 1000 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
              sx={{
                backgroundColor: '#1976d2',
                color: 'white',
                p: 1.5,
                borderRadius: 2,
                mr: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <LocalPoliceIcon fontSize="large" />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight="bold">
                Welcome, {currentOfficer.name}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Officer ID: {currentOfficer.id} • {currentOfficer.district} District
              </Typography>
            </Box>
          </Box>

          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleGoToIssueTicket}
              sx={{ fontWeight: 'bold', py: 1.5, px: 3, borderRadius: 2, boxShadow: 3 }}
            >
              Issue Fine Report
            </Button>
            <LogoutButton sx={{ color: '#0f172a', borderColor: '#cbd5e1' }} />
          </Stack>
        </Box>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid xs={12} sm={6}>
            <Card elevation={3} sx={{ borderRadius: 3, borderLeft: '6px solid #2e7d32' }}>
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary" sx={{ textTransform: 'uppercase' }} gutterBottom>
                  Cleared to Return License
                </Typography>
                <Typography variant="h3" color="success.main" fontWeight="bold">
                  {paidFinesCount}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid xs={12} sm={6}>
            <Card elevation={3} sx={{ borderRadius: 3, borderLeft: '6px solid #ed6c02' }}>
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary" sx={{ textTransform: 'uppercase' }} gutterBottom>
                  Pending Payments
                </Typography>
                <Typography variant="h3" color="warning.main" fontWeight="bold">
                  {pendingFinesCount}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Card elevation={3} sx={{ mb: 4, borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Generate Driver Token
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Add the driver details and violation, then share the generated token with the driver.
            </Typography>

            <form onSubmit={handleIssueDriverToken}>
              <Grid container spacing={2}>
                <Grid xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Driver Name"
                    name="driverName"
                    value={driverForm.driverName}
                    onChange={handleDriverFormChange}
                    required
                  />
                </Grid>
                <Grid xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Telephone Number"
                    name="phoneNumber"
                    value={driverForm.phoneNumber}
                    onChange={handleDriverFormChange}
                    required
                  />
                </Grid>
                <Grid xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Violation"
                    name="wrongDid"
                    value={driverForm.wrongDid}
                    onChange={handleDriverFormChange}
                    required
                  />
                </Grid>
                <Grid xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Fine Amount"
                    name="amount"
                    type="number"
                    value={driverForm.amount}
                    onChange={handleDriverFormChange}
                    required
                  />
                </Grid>
                <Grid xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Vehicle Number"
                    name="vehicleNumber"
                    value={driverForm.vehicleNumber}
                    onChange={handleDriverFormChange}
                  />
                </Grid>
                <Grid xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="License Number"
                    name="licenseNumber"
                    value={driverForm.licenseNumber}
                    onChange={handleDriverFormChange}
                  />
                </Grid>
                <Grid xs={12}>
                  {tokenError && (
                    <Alert severity="error" sx={{ mb: 1, mt: 1 }}>
                      {tokenError}
                    </Alert>
                  )}
                  <Button type="submit" variant="contained" disabled={issuingToken} sx={{ mt: 1 }}>
                    {issuingToken ? 'Generating...' : 'Generate Driver Token'}
                  </Button>
                </Grid>
              </Grid>
            </form>

            {generatedToken && (
              <Alert severity="success" sx={{ mt: 2, whiteSpace: 'pre-wrap' }}>
                Token generated for {generatedToken.username}. Share this 15-character token code with the driver:
                {'\n'}
                {generatedToken.tokenCode}
                {'\n'}
                Officer ID: {currentOfficer.id}
              </Alert>
            )}
          </CardContent>
        </Card>

        <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 3, overflow: 'hidden', mb: 4 }}>
          <Box sx={{ backgroundColor: '#0f172a', color: 'white', p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" fontWeight="medium">
              Saved Driver Tokens
            </Typography>
          </Box>

          {tokenHistory.length === 0 ? (
            <Alert severity="info" sx={{ m: 2 }}>
              No driver tokens have been generated yet.
            </Alert>
          ) : (
            <Box sx={{ width: '100%', backgroundColor: 'white', overflowX: 'auto' }}>
              <Table sx={{ minWidth: 1200 }} aria-label="saved driver tokens table">
                <TableHead sx={{ backgroundColor: '#f1f5f9' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Issued At</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Driver Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Phone Number</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Reference No.</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Violation</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Amount</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Token Code</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Access Token</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tokenHistory.map((row) => (
                    <TableRow
                      key={`${row.accessToken}-${row.savedAt}`}
                      sx={{
                        '&:last-child td, &:last-child th': { border: 0 },
                        '&:hover': { backgroundColor: '#f8fafc' },
                      }}
                    >
                      <TableCell sx={{ color: '#64748b', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                        {formatIssuedAt(row.savedAt)}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'medium' }}>{row.driverName || 'N/A'}</TableCell>
                      <TableCell sx={{ color: '#475569' }}>{row.phoneNumber || 'N/A'}</TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                        {row.referenceNumber || 'N/A'}
                      </TableCell>
                      <TableCell sx={{ maxWidth: 220 }}>{row.wrongDid || 'N/A'}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {formatAmount(row.amount)}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                        {row.tokenCode || 'N/A'}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontFamily: 'monospace',
                          fontSize: '0.8rem',
                          wordBreak: 'break-all',
                          maxWidth: 420,
                        }}
                      >
                        {row.accessToken}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}
        </TableContainer>

        <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 3, overflow: 'hidden', mb: 4 }}>
          <Box sx={{ backgroundColor: '#14532d', color: 'white', p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" fontWeight="medium">
              Payment Notifications
            </Typography>
          </Box>

          {notificationHistory.length === 0 ? (
            <Alert severity="info" sx={{ m: 2 }}>
              No payment notifications yet.
            </Alert>
          ) : (
            <Box sx={{ width: '100%', backgroundColor: 'white', overflowX: 'auto' }}>
              <Table sx={{ minWidth: 1100 }} aria-label="officer payment notifications table">
                <TableHead sx={{ backgroundColor: '#f1f5f9' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Time Paid</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Driver Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Phone</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Reference No.</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Amount</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Vehicle No.</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Message</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {notificationHistory.map((row) => (
                    <TableRow
                      key={`${row.referenceNumber}-${row.paidAt}`}
                      sx={{
                        '&:last-child td, &:last-child th': { border: 0 },
                        '&:hover': { backgroundColor: '#f8fafc' },
                      }}
                    >
                      <TableCell sx={{ color: '#64748b', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                        {formatIssuedAt(row.paidAt)}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'medium' }}>{row.driverName || 'N/A'}</TableCell>
                      <TableCell sx={{ color: '#475569' }}>{row.phoneNumber || 'N/A'}</TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                        {row.referenceNumber || 'N/A'}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'medium' }}>{formatAmount(row.amount)}</TableCell>
                      <TableCell sx={{ color: '#475569' }}>{row.vehicleNumber || 'N/A'}</TableCell>
                      <TableCell sx={{ maxWidth: 420, whiteSpace: 'normal', wordBreak: 'break-word' }}>
                        {row.message || 'Fine payment received.'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}
        </TableContainer>

        <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 3, overflow: 'hidden', mb: 4 }}>
          <Box sx={{ backgroundColor: '#1e293b', color: 'white', p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <PolicyIcon fontSize="small" />
            <Typography variant="h6" fontWeight="medium">
              Your Issued Tickets
            </Typography>
          </Box>

          {officerFines.length === 0 ? (
            <Alert severity="info" sx={{ m: 2 }}>
              You have not issued any tickets yet.
            </Alert>
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
                    <TableRow
                      key={row.referenceNumber}
                      sx={{
                        '&:last-child td, &:last-child th': { border: 0 },
                        '&:hover': { backgroundColor: '#f8fafc' },
                      }}
                    >
                      <TableCell component="th" scope="row" sx={{ fontWeight: 'medium' }}>
                        {row.referenceNumber}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#0f172a' }}>{row.vehicleNumber || 'N/A'}</TableCell>
                      <TableCell sx={{ fontWeight: 'medium', color: '#475569' }}>{row.driverLicense || 'N/A'}</TableCell>
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
                      <TableCell sx={{ color: '#64748b', fontSize: '0.875rem' }}>
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
