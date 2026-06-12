import { useState } from 'react';
import { Box, Typography, Card, CardContent, TextField, Button, Grid, Snackbar, Alert, Divider } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { createOfficer } from '../services/api';

export default function ManageOfficers() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [openSnackbar, setSnackbar] = useState(false);

  // ─── Input Handler ───
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ─── Submit Handler ───
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');

    try {
      await createOfficer({
        username: formData.username.trim(),
        password: formData.password,
      });
      setSnackbar(true);
      setFormData({ username: '', password: '' });
    } catch (error) {
      const apiMessage = error?.response?.data?.message;
      setErrorMessage(apiMessage || 'Unable to create officer account.');
    } finally {
      setSubmitting(false);
    }
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
                    label="Officer Username" 
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required 
                    fullWidth 
                  />
                  <TextField 
                    label="Temporary Password" 
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required 
                    fullWidth 
                  />
                  {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
                  <Button 
                    type="submit" 
                    variant="contained" 
                    size="large" 
                    disabled={submitting}
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
                1. Verify the officer's identity before creating a login.
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                2. Share the generated username and temporary password through a secure channel.
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                3. Drivers do not get passwords. Officers issue access tokens for driver login.
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