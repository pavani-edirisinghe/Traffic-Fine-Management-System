import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { 
  Box, Card, CardContent, Typography, Button, 
  Alert, CircularProgress, Divider, Paper 
} from '@mui/material';
import PolicyIcon from '@mui/icons-material/Policy';
import PaymentIcon from '@mui/icons-material/Payment';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { mockFines } from '../data/mockData'; 
import { appendOfficerNotification, getAuth, getDriverContext, parseJwtPayload } from '../services/auth';
import LogoutButton from '../components/LogoutButton';

export default function DriverPortal() {
  const location = useLocation();
  const navigate = useNavigate();

  const auth = getAuth();
  const payload = auth?.accessToken ? parseJwtPayload(auth.accessToken) : null;
  const tokenCtx = payload || null;

  const ctx = location.state || getDriverContext() || tokenCtx || {};
  const { referenceNumber, categoryIdentifier } = ctx;

  const hasTokenFine = Boolean(ctx?.wrongDid || ctx?.amount || ctx?.driverName);
  const tokenFine = hasTokenFine
    ? {
        referenceNumber: ctx.referenceNumber || 'N/A',
        categoryName: ctx.wrongDid || ctx.categoryIdentifier || 'Traffic Violation',
        amount: Number(ctx.amount || 0),
        vehicleNumber: ctx.vehicleNumber || 'N/A',
        driverLicense: ctx.licenseNumber || 'N/A',
        status: 'PENDING',
        driverName: ctx.driverName,
        phoneNumber: ctx.phoneNumber,
        officerId: ctx.officerId,
      }
    : null;

  const [fineDetails, setFineDetails] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(null);

  if (!referenceNumber && !hasTokenFine) {
    return <Navigate to="/login" replace />;
  }

  useEffect(() => {
    if (tokenFine) {
      setFineDetails(tokenFine);
      setLoading(false);
      return;
    }

    setTimeout(() => {
      const foundFine = mockFines.find(
        f => f.referenceNumber === referenceNumber && 
             f.categoryIdentifier === categoryIdentifier
      );

      if (foundFine) {
        setFineDetails(foundFine);
      } else {
        setError('No fine found with those details. Please check your reference number and try again.');
      }
      setLoading(false);
    }, 1000); // Small 1-second delay to simulate network request
  }, [referenceNumber, categoryIdentifier, hasTokenFine, ctx?.wrongDid, ctx?.amount, ctx?.driverName, ctx?.referenceNumber, ctx?.categoryIdentifier]);

  const handlePayment = () => {
    setLoading(true);
    setTimeout(() => {
      const paidAt = new Date().toISOString();
      const paidNotification = {
        officerId: fineDetails?.officerId || 'unknown',
        referenceNumber: fineDetails?.referenceNumber || 'N/A',
        driverName: fineDetails?.driverName || 'N/A',
        phoneNumber: fineDetails?.phoneNumber || 'N/A',
        vehicleNumber: fineDetails?.vehicleNumber || 'N/A',
        amount: fineDetails?.amount || 0,
        paidAt,
        message: `${fineDetails?.driverName || 'Driver'} paid Rs. ${Number(fineDetails?.amount || 0).toLocaleString()} for ${fineDetails?.referenceNumber || 'the ticket'} at ${new Date(paidAt).toLocaleString('en-US')}`,
      };

      if (fineDetails?.officerId) {
        appendOfficerNotification(fineDetails.officerId, paidNotification);
      }

      const matchedFine = mockFines.find((fine) => fine.referenceNumber === fineDetails?.referenceNumber);
      if (matchedFine) {
        matchedFine.status = 'PAID';
        matchedFine.datePaid = paidAt;
      }

      setPaymentStatus('SUCCESS');
      setFineDetails({ ...fineDetails, status: 'PAID', datePaid: paidAt });
      setLoading(false);
    }, 1500);
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
      
      {/* Back Button */}
      <Box sx={{ width: '100%', maxWidth: 480, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'space-between' }}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate('/login')}
            sx={{ fontWeight: 'bold' }}
          >
            Search Another Ticket
          </Button>
          <LogoutButton sx={{ color: '#0f172a', borderColor: '#cbd5e1' }} />
        </Box>
      </Box>

      <Card elevation={6} sx={{ maxWidth: 480, width: '100%', borderRadius: 3, overflow: 'hidden' }}>
        
        {/* Header */}
        <Box sx={{ 
          backgroundColor: '#1976d2', 
          color: 'white', 
          p: 2, 
          textAlign: 'center',
        }}>
          <PolicyIcon sx={{ fontSize: 38, mb: 1 }} />
          <Typography variant="h5" fontWeight="bold">
            Traffic Fine Portal
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.9 }}>
            Sri Lanka Police Department
          </Typography>
        </Box>

        <CardContent sx={{ p: 3 }}>
          
          {loading && !fineDetails && !error ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
              <CircularProgress sx={{ mb: 2 }} />
              <Typography color="textSecondary">Searching for ticket...</Typography>
            </Box>
          ) : null}

          {error && (
            <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
          )}

          {/* Fine Details */}
          {fineDetails && (
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Ticket Found: {fineDetails.referenceNumber}
              </Typography>

              {fineDetails.driverName ? (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Driver: {fineDetails.driverName} {fineDetails.phoneNumber ? `• ${fineDetails.phoneNumber}` : ''}
                </Typography>
              ) : null}

              <Paper elevation={0} sx={{ backgroundColor: '#f1f5f9', p: 2, borderRadius: 2, mb: 3, mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="textSecondary">Wrong Did:</Typography>
                  <Typography variant="body2" fontWeight="bold">{fineDetails.categoryName}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="textSecondary">Vehicle No:</Typography>
                  <Typography variant="body2" fontWeight="bold">{fineDetails.vehicleNumber}</Typography>
                </Box>
                {fineDetails.officerId ? (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="textSecondary">Officer ID:</Typography>
                    <Typography variant="body2" fontWeight="bold">{fineDetails.officerId}</Typography>
                  </Box>
                ) : null}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="textSecondary">Status:</Typography>
                  <Typography variant="body2" fontWeight="bold" color={fineDetails.status === 'PAID' ? 'success.main' : 'warning.main'}>
                    {fineDetails.status}
                  </Typography>
                </Box>
                <Divider sx={{ my: 1.5 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="textSecondary">Amount Due:</Typography>
                  <Typography variant="h6" fontWeight="bold" color="error.main">
                    Rs. {fineDetails.amount.toLocaleString()}
                  </Typography>
                </Box>
              </Paper>

              {paymentStatus === 'SUCCESS' || fineDetails.status === 'PAID' ? (
                <Alert severity="success" sx={{ borderRadius: 2 }}>
                  Payment successful! An SMS notification has been sent to the issuing officer.
                </Alert>
              ) : (
                <Button 
                  variant="contained" 
                  color="success" 
                  fullWidth 
                  size="large"
                  onClick={handlePayment}
                  disabled={loading}
                  startIcon={!loading && <PaymentIcon />}
                  sx={{ py: 1.5, fontWeight: 'bold', borderRadius: 2 }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : `Pay Rs. ${fineDetails.amount.toLocaleString()}`}
                </Button>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}