import { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, TextField, Button,
  Grid, Snackbar, Alert, Divider, Paper,
  Table, TableBody, TableCell, TableHead, TableRow
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { createOfficer, getOfficers } from '../services/api';

export default function ManageOfficers() {
  const [formData, setFormData] = useState({
    fullName: '',
    badgeId: '',
    username: '',
    password: '',
    phoneNumber: '',
    district: '',
  });
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, severity: 'success', message: '' });

  useEffect(() => {
    fetchOfficers();
  }, []);

  const fetchOfficers = async () => {
    try {
      const data = await getOfficers();
      setOfficers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load officers', err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await createOfficer({
        username: formData.username.trim(),
        password: formData.password.trim(),
        fullName: formData.fullName.trim(),
        badgeId: formData.badgeId.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        district: formData.district.trim(),
      });
      setSnackbar({
        open: true,
        severity: 'success',
        message: `Officer "${result.username}" created. Temporary password: ${result.temporaryPassword}`,
      });
      setFormData({ fullName: '', badgeId: '', username: '', password: '', phoneNumber: '', district: '' });
      fetchOfficers();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data || 'Failed to create officer.';
      setSnackbar({ open: true, severity: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Manage Officers</Typography>

      <Grid container spacing={3}>
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
                    label="Username (e.g. officer email or ID)"
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
                    inputProps={{ minLength: 8 }}
                    helperText="Minimum 8 characters"
                  />
                  <TextField
                    label="Phone Number"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    required
                    fullWidth
                  />
                  <TextField
                    label="Assigned District / Station"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    required
                    fullWidth
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{ mt: 2, py: 1.5, fontWeight: 'bold' }}
                  >
                    {loading ? 'Creating...' : 'Generate Officer Account'}
                  </Button>
                </Box>
              </form>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Security Protocol</Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body2" color="text.secondary" paragraph>
                1. Verify the officer's credentials before creating an account.
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                2. The temporary password you set will be shown once after creation — share it securely with the officer.
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                3. The officer uses the username and temporary password to log in via the officer portal.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {officers.length > 0 && (
        <Paper elevation={2}>
          <Box sx={{ p: 2, borderBottom: '1px solid #e2e8f0' }}>
            <Typography variant="h6" fontWeight="bold">Registered Officers</Typography>
          </Box>
          <Table>
            <TableHead sx={{ backgroundColor: '#f1f5f9' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Full Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Badge ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Username</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>District</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Phone</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {officers.map((o) => (
                <TableRow key={o.id}>
                  <TableCell>{o.fullName || o.displayName || 'N/A'}</TableCell>
                  <TableCell>{o.badgeId || 'N/A'}</TableCell>
                  <TableCell>{o.username}</TableCell>
                  <TableCell>{o.district || 'N/A'}</TableCell>
                  <TableCell>{o.phoneNumber || 'N/A'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={8000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
