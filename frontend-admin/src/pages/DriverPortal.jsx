import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Button,
  Alert, CircularProgress, Divider, Paper
} from '@mui/material';
import PolicyIcon from '@mui/icons-material/Policy';
import PaymentIcon from '@mui/icons-material/Payment';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getAuth, getDriverContext, parseJwtPayload } from '../services/auth';
import { getDriverFines, payFine } from '../services/api';
import LogoutButton from '../components/LogoutButton';

export default function DriverPortal() {
  const location = useLocation();
  const navigate = useNavigate();

  const auth = getAuth();
  const payload = auth?.accessToken ? parseJwtPayload(auth.accessToken) : null;
  const ctx = location.state || getDriverContext() || payload || {};
  const fineIdFromToken = payload?.fineId ?? ctx?.fineId;

  const [fineDetails, setFineDetails] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);

  useEffect(() => {
    getDriverFines()
      .then((fines) => {
        if (!fines || fines.length === 0) {
          setError('No fine found for your account. Contact the issuing officer.');
          return;
        }
        const target = fineIdFromToken
          ? fines.find((f) => f.id === Number(fineIdFromToken)) ?? fines[0]
          : fines[0];
        setFineDetails(target);
      })
      .catch(() => setError('Could not load fine details. Please try again.'))
      .finally(() => setLoading(false));
  }, [fineIdFromToken]);

  if (!auth?.accessToken || auth?.role !== 'DRIVER') {
    return <Navigate to="/login" replace />;
  }

  const handlePayment = async () => {
    if (!fineDetails) return;
    setPaying(true);
    try {
      const updated = await payFine(fineDetails.id, 'ONLINE');
      setFineDetails(updated);
      setPaymentStatus('SUCCESS');
    } catch (e) {
      setError(e?.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setPaying(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f8fafc',
      p: 2
    }}>
      <Box sx={{ width: '100%', maxWidth: 480, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'space-between' }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/login')}
            sx={{ fontWeight: 'bold' }}
          >
            Back to Login
          </Button>
          <LogoutButton sx={{ color: '#0f172a', borderColor: '#cbd5e1' }} />
        </Box>
      </Box>

      <Card elevation={6} sx={{ maxWidth: 480, width: '100%', borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{
          backgroundColor: '#1976d2',
          color: 'white',
          p: 2,
          textAlign: 'center',
        }}>
          <PolicyIcon sx={{ fontSize: 38, mb: 1 }} />
          <Typography variant="h5" fontWeight="bold">Traffic Fine Portal</Typography>
          <Typography variant="caption" sx={{ opacity: 0.9 }}>Sri Lanka Police Department</Typography>
        </Box>

        <CardContent sx={{ p: 3 }}>
          {loading && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
              <CircularProgress sx={{ mb: 2 }} />
              <Typography color="textSecondary">Loading your fine details...</Typography>
            </Box>
          )}

          {!loading && error && (
            <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
          )}

          {!loading && fineDetails && (
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Ticket: {fineDetails.referenceNumber}
              </Typography>

              {fineDetails.driverName && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Driver: {fineDetails.driverName}
                  {fineDetails.driverPhone ? ` • ${fineDetails.driverPhone}` : ''}
                </Typography>
              )}

              <Paper elevation={0} sx={{ backgroundColor: '#f1f5f9', p: 2, borderRadius: 2, mb: 3, mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="textSecondary">Violation:</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {fineDetails.categoryName || fineDetails.categoryIdentifier}
                  </Typography>
                </Box>
                {fineDetails.vehicleNumber && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="textSecondary">Vehicle No:</Typography>
                    <Typography variant="body2" fontWeight="bold">{fineDetails.vehicleNumber}</Typography>
                  </Box>
                )}
                {fineDetails.driverLicense && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="textSecondary">License No:</Typography>
                    <Typography variant="body2" fontWeight="bold">{fineDetails.driverLicense}</Typography>
                  </Box>
                )}
                {fineDetails.officerUsername && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="textSecondary">Issued By:</Typography>
                    <Typography variant="body2" fontWeight="bold">{fineDetails.officerUsername}</Typography>
                  </Box>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="textSecondary">Status:</Typography>
                  <Typography
                    variant="body2"
                    fontWeight="bold"
                    color={fineDetails.status === 'PAID' ? 'success.main' : 'warning.main'}
                  >
                    {fineDetails.status}
                  </Typography>
                </Box>
                <Divider sx={{ my: 1.5 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="textSecondary">Amount Due:</Typography>
                  <Typography variant="h6" fontWeight="bold" color="error.main">
                    Rs. {Number(fineDetails.amount || 0).toLocaleString()}
                  </Typography>
                </Box>
              </Paper>

              {paymentStatus === 'SUCCESS' || fineDetails.status === 'PAID' ? (
                <Alert severity="success" sx={{ borderRadius: 2 }}>
                  Payment successful! The issuing officer has been notified via in-app notification and SMS.
                </Alert>
              ) : (
                <Button
                  variant="contained"
                  color="success"
                  fullWidth
                  size="large"
                  onClick={handlePayment}
                  disabled={paying}
                  startIcon={!paying && <PaymentIcon />}
                  sx={{ py: 1.5, fontWeight: 'bold', borderRadius: 2 }}
                >
                  {paying
                    ? <CircularProgress size={24} color="inherit" />
                    : `Pay Rs. ${Number(fineDetails.amount || 0).toLocaleString()}`}
                </Button>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
