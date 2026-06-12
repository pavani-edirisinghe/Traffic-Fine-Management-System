import { useState } from 'react';
import { 
  Box, Card, CardContent, Typography, TextField, 
  Button, MenuItem, FormControl, InputLabel, Select, Divider 
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { mockFines } from '../data/mockData';
import { getOfficerProfile } from '../services/auth';
import LogoutButton from '../components/LogoutButton';

export default function IssueTicket() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentOfficer = location.state?.currentOfficer || getOfficerProfile();

  const [newTicket, setNewTicket] = useState({ 
    categoryIdentifier: '', 
    amount: '',
    vehicleNumber: '', 
    driverLicense: ''  
  });

  // Security Check
  if (!currentOfficer) {
    return <Navigate to="/login" replace />;
  }

  const violationCategories = [
    { id: 'SPEEDING_OVER_20', name: 'Speeding' },
    { id: 'ILLEGAL_PARKING', name: 'Illegal Parking' },
    { id: 'NO_LICENSE', name: 'Driving Without License' },
    { id: 'RECKLESS_DRIVING', name: 'Reckless Driving' }
  ];

  const handleIssueTicket = (e) => {
    e.preventDefault();
    
    const categoryName = violationCategories.find(c => c.id === newTicket.categoryIdentifier)?.name || 'Unknown';

    const newFineObject = {
      referenceNumber: `FIN-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      officerId: currentOfficer.id,
      categoryIdentifier: newTicket.categoryIdentifier,
      categoryName: categoryName,
      amount: Number(newTicket.amount),
      vehicleNumber: newTicket.vehicleNumber.toUpperCase(),
      driverLicense: newTicket.driverLicense.toUpperCase(),
      status: "PENDING",
      district: currentOfficer.district,
      dateIssued: new Date().toISOString(),
      datePaid: null
    };

    // Because we are using mock data, we mutate the array directly so it survives the page change
    mockFines.unshift(newFineObject);
    
    // Navigate back to the dashboard and pass the officer back so they stay logged in
    navigate('/officer', { state: { currentOfficer } });
  };

  return (
    <Box sx={{ minHeight: '80vh', backgroundColor: '#f8fafc', p: 4, display: 'flex', justifyContent: 'center' }}>
      <Box sx={{ width: '100%', maxWidth: 600 }}>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate('/officer', { state: { currentOfficer } })}
            sx={{ fontWeight: 'bold' }}
          >
            Back to Dashboard
          </Button>
          <LogoutButton sx={{ color: '#0f172a', borderColor: '#cbd5e1' }} />
        </Box>

        <Card elevation={4} sx={{ borderRadius: 3 }}>
          <Box sx={{ backgroundColor: '#1976d2', color: 'white', p: 2 }}>
            <Typography variant="h5" fontWeight="bold">Issue New Traffic Fine</Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Officer: {currentOfficer.name} ({currentOfficer.id})
            </Typography>
          </Box>
          
          <CardContent sx={{ p: 4 }}>
            <form onSubmit={handleIssueTicket}>
              
              <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 2 }}>VIOLATION DETAILS</Typography>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Violation Category *</InputLabel>
                <Select
                  value={newTicket.categoryIdentifier}
                  label="Violation Category *"
                  required
                  onChange={(e) => setNewTicket({ ...newTicket, categoryIdentifier: e.target.value })}
                >
                  {violationCategories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Fine Amount (LKR)"
                type="number"
                variant="outlined"
                required
                sx={{ mb: 3 }}
                value={newTicket.amount}
                onChange={(e) => setNewTicket({ ...newTicket, amount: e.target.value })}
              />

              <Divider sx={{ mb: 3 }} />
              <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 2 }}>VEHICLE & DRIVER INFO</Typography>

              <TextField
                fullWidth
                label="Vehicle Registration No."
                placeholder="e.g. WP CAA-1234"
                variant="outlined"
                required
                sx={{ mb: 2 }}
                value={newTicket.vehicleNumber}
                onChange={(e) => setNewTicket({ ...newTicket, vehicleNumber: e.target.value })}
              />

              <TextField
                fullWidth
                label="Driver License Number"
                placeholder="e.g. B1234567"
                variant="outlined"
                required
                sx={{ mb: 3 }}
                value={newTicket.driverLicense}
                onChange={(e) => setNewTicket({ ...newTicket, driverLicense: e.target.value })}
              />

              <Button 
                type="submit"
                variant="contained" 
                color="primary"
                fullWidth
                size="large"
                sx={{ py: 1, fontWeight: 'bold', fontSize: '1rem', borderRadius: 2 }}
              >
                Submit & Issue Ticket
              </Button>

            </form>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}