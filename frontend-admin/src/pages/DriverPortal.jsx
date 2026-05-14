import { useState } from 'react';
import { 
  Box, Card, CardContent, Typography, TextField, 
  Button, Alert, CircularProgress, Divider, InputAdornment, Paper 
} from '@mui/material';
import PolicyIcon from '@mui/icons-material/Policy';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import CommuteIcon from '@mui/icons-material/Commute';
import SearchIcon from '@mui/icons-material/Search';
import PaymentIcon from '@mui/icons-material/Payment';
import { mockFines } from '../data/mockData'; 

export default function DriverPortal() {
  const [searchParams, setSearchParams] = useState({ referenceNumber: '', categoryIdentifier: '' });
  const [fineDetails, setFineDetails] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);

  const handleSearch = (e) => {
    e.preventDefault();
    setError('');
    setPaymentStatus(null);
    setLoading(true);

    setTimeout(() => {
      const foundFine = mockFines.find(
        f => f.referenceNumber === searchParams.referenceNumber && 
             f.categoryIdentifier === searchParams.categoryIdentifier
      );

      if (foundFine) {
        setFineDetails(foundFine);
      } else {
        setError('No fine found with those details. Please check your ticket.');
        setFineDetails(null);
      }
      setLoading(false);
    }, 800);
  };

  const handlePayment = () => {
    setLoading(true);
    setTimeout(() => {
      setPaymentStatus('SUCCESS');
      setFineDetails({ ...fineDetails, status: 'PAID' });
      setLoading(false);
    }, 1500);
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundColor: '#f8fafc',
      p: 2
    }}>
      {/* Reduced maxWidth slightly for a tighter look */}
      <Card elevation={6} sx={{ maxWidth: 480, width: '100%', borderRadius: 3, overflow: 'visible' }}>
        
        {/* COMPACT Header */}
        <Box sx={{ 
          backgroundColor: '#1976d2', 
          color: 'white', 
          p: 2, 
          textAlign: 'center',
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12
        }}>
          <PolicyIcon sx={{ fontSize: 38, mb: 1 }} />
          <Typography variant="h5" fontWeight="bold">
            Traffic Fine Portal
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.9 }}>
            Sri Lanka Police Department
          </Typography>
        </Box>

        {/* COMPACT Content Area */}
        <CardContent sx={{ p: 2.5 }}>
          <form onSubmit={handleSearch}>
            <TextField
              fullWidth
              size="small"
              label="Reference Number"
              placeholder="e.g., FIN-2026-8901"
              variant="outlined"
              sx={{ mb: 2 }}
              required
              value={searchParams.referenceNumber}
              onChange={(e) => setSearchParams({ ...searchParams, referenceNumber: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <ReceiptLongIcon color="action" fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              size="small"
              label="Category Identifier"
              placeholder="e.g., SPEEDING_OVER_20"
              variant="outlined"
              sx={{ mb: 2 }}
              required
              value={searchParams.categoryIdentifier}
              onChange={(e) => setSearchParams({ ...searchParams, categoryIdentifier: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CommuteIcon color="action" fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <Button 
              type="submit" 
              variant="contained" 
              fullWidth 
              disabled={loading}
              startIcon={!loading && <SearchIcon />}
              sx={{ py: 1, fontWeight: 'bold', borderRadius: 2 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Search Fine'}
            </Button>
          </form>
          
          {error && <Alert severity="error" sx={{ mt: 2, py: 0, borderRadius: 2 }}>{error}</Alert>}

          {/* Fine Details - Reduced Spacing */}
          {fineDetails && (
            <Box sx={{ mt: 2 }}>
              <Divider sx={{ mb: 1.5 }}>
                <Typography variant="caption" color="textSecondary">Ticket Found</Typography>
              </Divider>

              <Paper elevation={0} sx={{ backgroundColor: '#f1f5f9', p: 1.5, borderRadius: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" color="textSecondary">Violation:</Typography>
                  <Typography variant="body2" fontWeight="bold">{fineDetails.categoryName}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" color="textSecondary">Status:</Typography>
                  <Typography variant="body2" fontWeight="bold" color={fineDetails.status === 'PAID' ? 'success.main' : 'warning.main'}>
                    {fineDetails.status}
                  </Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="textSecondary">Amount Due:</Typography>
                  <Typography variant="subtitle1" fontWeight="bold" color="error.main">
                    Rs. {fineDetails.amount.toLocaleString()}
                  </Typography>
                </Box>
              </Paper>

              {paymentStatus === 'SUCCESS' || fineDetails.status === 'PAID' ? (
                <Alert severity="success" sx={{ borderRadius: 2, py: 0 }}>
                  Payment successful! SMS sent to officer.
                </Alert>
              ) : (
                <Button 
                  variant="contained" 
                  color="success" 
                  fullWidth 
                  onClick={handlePayment}
                  disabled={loading}
                  startIcon={!loading && <PaymentIcon />}
                  sx={{ py: 1, fontWeight: 'bold', borderRadius: 2 }}
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