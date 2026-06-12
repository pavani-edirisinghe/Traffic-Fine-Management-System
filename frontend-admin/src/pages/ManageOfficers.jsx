import { useState } from 'react';
import { Box, Typography, Card, CardContent, TextField, Button, Grid, Snackbar, Alert, Divider } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

export default function ManageOfficers() {
  const [formData, setFormData] = useState({
    fullName: '',
    badgeId: '',
    email: '',
    station: ''
  });
  const [openSnackbar, setSnackbar] = useState(false);

  // ─── Input Handler ───
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ─── Submit Handler ───
  const handleSubmit = (e) => {
    e.preventDefault();
    // Later, this is where we will send the data to the Spring Boot backend
    console.log("Registering Officer:", formData);
    
    // Show success message and clear form
    setSnackbar(true);
    setFormData({ fullName: '', badgeId: '', email: '', station: '' });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Manage Officers</Typography>

      <Grid container spacing={3}>
        {/* Registration Form Column */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <Box sx={{ bgcolor: '#1976d2', color: 'white', p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonAddIcon />
              <Typography variant="h6">Register New Officer</Typography>
            </Box>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
                  <TextField 
                    label="Full Name" 
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required 
                    fullWidth 
                  />
                  <TextField 
                    label="Badge ID / Service No." 
                    name="badgeId"
                    value={formData.badgeId}
                    onChange={handleChange}
                    required 
                    fullWidth 
                  />
                  <TextField 
                    label="Official Email" 
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required 
                    fullWidth 
                  />
                  <TextField 
                    label="Assigned Police Station" 
                    name="station"
                    value={formData.station}
                    onChange={handleChange}
                    required 
                    fullWidth 
                  />
                  <Button 
                    type="submit" 
                    variant="contained" 
                    size="large" 
                    sx={{ mt: 2, py: 1.5, fontWeight: 'bold' }}
                  >
                    Generate Officer Account
                  </Button>
                </Box>
              </form>
            </CardContent>
          </Card>
        </Grid>

        {/* Instructions / Recent Column */}
        <Grid item xs={12} md={6}>
          <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Security Protocol</Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body2" color="text.secondary" paragraph>
                1. Verify the officer's credentials before creating an account.
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                2. Generating an account will automatically send a temporary password to the provided official email address.
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                3. The officer will be forced to change this password upon their first login to the mobile application or officer portal.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Success Notification */}
      <Snackbar 
        open={openSnackbar} 
        autoHideDuration={4000} 
        onClose={() => setSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbar(false)} severity="success" sx={{ width: '100%' }}>
          Officer account generated successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
}