import { useState } from 'react';
import { 
  Box, Card, CardContent, Typography, TextField, 
  Button, Alert, CircularProgress, Divider 
} from '@mui/material';
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

    // MOCK API CALL: Searching for the fine
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
    // MOCK API CALL: Processing payment
    setTimeout(() => {
      setPaymentStatus('SUCCESS');
      setFineDetails({ ...fineDetails, status: 'PAID' });
      setLoading(false);
    }, 1500);
  };

  return (
    <Box sx={{ p: 4, maxWidth: 600, margin: '0 auto' }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Public Fine Payment Portal
      </Typography>
      
      {/* Search Form */}
      <Card elevation={3} sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Find Your Ticket</Typography>
          <form onSubmit={handleSearch}>
            <TextField
              fullWidth
              label="Reference Number (e.g., FIN-2026-8901)"
              variant="outlined"
              sx={{ mb: 2 }}
              required
              value={searchParams.referenceNumber}
              onChange={(e) => setSearchParams({ ...searchParams, referenceNumber: e.target.value })}
            />
            <TextField
              fullWidth
              label="Category Identifier (e.g., SPEEDING_OVER_20)"
              variant="outlined"
              sx={{ mb: 3 }}
              required
              value={searchParams.categoryIdentifier}
              onChange={(e) => setSearchParams({ ...searchParams, categoryIdentifier: e.target.value })}
            />
            <Button 
              type="submit" 
              variant="contained" 
              fullWidth 
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Search Fine'}
            </Button>
          </form>
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </CardContent>
      </Card>

      {/* Fine Details & Payment Section */}
      {fineDetails && (
        <Card elevation={3} sx={{ borderTop: '4px solid #1976d2' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Ticket Details</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography color="textSecondary">Violation:</Typography>
              <Typography fontWeight="bold">{fineDetails.categoryName}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography color="textSecondary">Amount Due:</Typography>
              <Typography fontWeight="bold" color="error">Rs. {fineDetails.amount}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography color="textSecondary">Status:</Typography>
              <Typography fontWeight="bold" color={fineDetails.status === 'PAID' ? 'success.main' : 'warning.main'}>
                {fineDetails.status}
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            {paymentStatus === 'SUCCESS' || fineDetails.status === 'PAID' ? (
              <Alert severity="success">
                Payment successful! An SMS has been sent to the traffic officer to release your license.
              </Alert>
            ) : (
              <Button 
                variant="contained" 
                color="success" 
                fullWidth 
                size="large"
                onClick={handlePayment}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : `Pay Rs. ${fineDetails.amount} Now`}
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
}