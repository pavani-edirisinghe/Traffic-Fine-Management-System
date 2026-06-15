import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Paper,
} from '@mui/material';
import PolicyIcon from '@mui/icons-material/Policy';
import PaymentIcon from '@mui/icons-material/Payment';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import {
  appendOfficerNotification,
  getAuth,
  getDriverContext,
  parseJwtPayload,
} from '../services/auth';

import {
  getFineByReferenceNumber,
  payFineById,
} from '../services/api';

import LogoutButton from '../components/LogoutButton';

export default function DriverPortal() {
  const location = useLocation();
  const navigate = useNavigate();

  const auth = getAuth();
  const payload = auth?.accessToken ? parseJwtPayload(auth.accessToken) : null;

  const ctx = location.state || getDriverContext() || payload || {};
  const { referenceNumber } = ctx;

  const [fineDetails, setFineDetails] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(null);

  const refNo = referenceNumber || ctx?.referenceNumber;

  useEffect(() => {
    const loadFine = async () => {
      try {
        setLoading(true);
        setError('');

        if (!refNo) {
          setError('Reference number not found.');
          return;
        }

        const dbFine = await getFineByReferenceNumber(refNo);

        if (dbFine) {
          setFineDetails({
            id: dbFine.id,
            referenceNumber: dbFine.referenceNumber || refNo,
            categoryName:
              dbFine.categoryName ||
              dbFine.description ||
              dbFine.wrongDid ||
              'Traffic Violation',
            amount: Number(dbFine.amount || 0),
            vehicleNumber: dbFine.vehicleNumber || 'N/A',
            driverLicense: dbFine.driverLicense || dbFine.licenseNumber || 'N/A',
            status: dbFine.status || 'PENDING',
            datePaid: dbFine.datePaid || null,
            driverName: dbFine.driverName || 'N/A',
            phoneNumber: dbFine.phoneNumber || 'N/A',
            officerId: dbFine.officerId || 'unknown',
          });
        } else {
          setError(
            'No fine found with those details. Please check your reference number and try again.'
          );
        }
      } catch (err) {
        console.error('Error loading fine:', err);
        setError('Unable to load fine details from database.');
      } finally {
        setLoading(false);
      }
    };

    loadFine();
  }, [refNo]);

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError('');

      const paidFine = await payFineById(
        fineDetails.id,
        fineDetails.amount,
        'ONLINE'
      );

      const paidAt = paidFine?.datePaid || new Date().toISOString();

      const paidNotification = {
        officerId: fineDetails?.officerId || 'unknown',
        referenceNumber: fineDetails?.referenceNumber || 'N/A',
        driverName: fineDetails?.driverName || 'N/A',
        phoneNumber: fineDetails?.phoneNumber || 'N/A',
        vehicleNumber: fineDetails?.vehicleNumber || 'N/A',
        amount: fineDetails?.amount || 0,
        paidAt,
        message: `${fineDetails?.driverName || 'Driver'} paid Rs. ${Number(
          fineDetails?.amount || 0
        ).toLocaleString()} for ${
          fineDetails?.referenceNumber || 'the ticket'
        } at ${new Date(paidAt).toLocaleString('en-US')}`,
      };

      if (fineDetails?.officerId) {
        appendOfficerNotification(fineDetails.officerId, paidNotification);
      }

      setPaymentStatus('SUCCESS');

      setFineDetails({
        ...fineDetails,
        ...paidFine,
        status: 'PAID',
        datePaid: paidAt,
      });
    } catch (err) {
      console.error('Payment error:', err);
      setError('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!refNo) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
        p: 2,
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 480, mb: 2 }}>
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
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

      <Card
        elevation={6}
        sx={{
          maxWidth: 480,
          width: '100%',
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            backgroundColor: '#1976d2',
            color: 'white',
            p: 2,
            textAlign: 'center',
          }}
        >
          <PolicyIcon sx={{ fontSize: 38, mb: 1 }} />

          <Typography variant="h5" fontWeight="bold">
            Traffic Fine Portal
          </Typography>

          <Typography variant="caption" sx={{ opacity: 0.9 }}>
            Sri Lanka Police Department
          </Typography>
        </Box>

        <CardContent sx={{ p: 3 }}>
          {loading && !fineDetails && !error && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                py: 4,
              }}
            >
              <CircularProgress sx={{ mb: 2 }} />
              <Typography color="textSecondary">
                Searching for ticket...
              </Typography>
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ borderRadius: 2, mb: 2 }}>
              {error}
            </Alert>
          )}

          {fineDetails && (
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Ticket Found: {fineDetails.referenceNumber}
              </Typography>

              {fineDetails.driverName && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Driver: {fineDetails.driverName}{' '}
                  {fineDetails.phoneNumber ? `• ${fineDetails.phoneNumber}` : ''}
                </Typography>
              )}

              <Paper
                elevation={0}
                sx={{
                  backgroundColor: '#f1f5f9',
                  p: 2,
                  borderRadius: 2,
                  mb: 3,
                  mt: 2,
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="textSecondary">
                    Wrong Did:
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {fineDetails.categoryName}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="textSecondary">
                    Vehicle No:
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {fineDetails.vehicleNumber}
                  </Typography>
                </Box>

                {fineDetails.officerId && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="textSecondary">
                      Officer ID:
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {fineDetails.officerId}
                    </Typography>
                  </Box>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="textSecondary">
                    Status:
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight="bold"
                    color={
                      fineDetails.status === 'PAID'
                        ? 'success.main'
                        : 'warning.main'
                    }
                  >
                    {fineDetails.status}
                  </Typography>
                </Box>

                {fineDetails.datePaid && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="textSecondary">
                      Paid Date:
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {new Date(fineDetails.datePaid).toLocaleString()}
                    </Typography>
                  </Box>
                )}

                <Divider sx={{ my: 1.5 }} />

                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="body2" color="textSecondary">
                    Amount Due:
                  </Typography>

                  <Typography variant="h6" fontWeight="bold" color="error.main">
                    Rs. {Number(fineDetails.amount || 0).toLocaleString()}
                  </Typography>
                </Box>
              </Paper>

              {paymentStatus === 'SUCCESS' || fineDetails.status === 'PAID' ? (
                <Alert severity="success" sx={{ borderRadius: 2 }}>
                  Payment successful! This fine has already been paid.
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
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    `Pay Rs. ${Number(fineDetails.amount || 0).toLocaleString()}`
                  )}
                </Button>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}