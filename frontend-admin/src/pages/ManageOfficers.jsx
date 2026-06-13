import { useState, useEffect } from 'react';
// REMOVE the duplicate import
import { Box, Typography, Card, CardContent, TextField, Button, Grid, Snackbar, Alert, Table, TableBody, TableCell, TableHead, TableRow, Paper } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { createOfficer, getOfficers } from '../services/api';

export default function ManageOfficers() {
  const [formData, setFormData] = useState({
    username: '', password: '', fullName: '', badgeId: '', phoneNumber: '', district: ''
  });
  const [officers, setOfficers] = useState([]);
  const [openSnackbar, setSnackbar] = useState(false);

  useEffect(() => {
    fetchOfficers();
  }, []);

  const fetchOfficers = async () => {
    try {
      const data = await getOfficers();
      setOfficers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load officers", err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createOfficer(formData);
      setSnackbar(true);
      setFormData({ username: '', password: '', fullName: '', badgeId: '', phoneNumber: '', district: '' });
      fetchOfficers();
    } catch (error) {
      console.error("Failed to register officer", error);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 3 }}>
      <Typography variant="h4">Manage Officers</Typography>

      <Card>
  <CardContent>
    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
      <PersonAddIcon /> Register New Officer
    </Typography>
    <form onSubmit={handleSubmit}>
      <Grid container spacing={2}>
        {/* Mapping fields explicitly to labels to avoid string manipulation errors */}
        {[
          { key: 'username', label: 'Username' },
          { key: 'password', label: 'Password' },
          { key: 'fullName', label: 'Full Name' },
          { key: 'badgeId', label: 'Badge ID' },
          { key: 'phoneNumber', label: 'Phone Number' },
          { key: 'district', label: 'District' }
        ].map((field) => (
          <Grid key={field.key} size={{ xs: 12, md: 4 }}>
            <TextField 
              fullWidth 
              label={field.label} 
              name={field.key} 
              type={field.key === 'password' ? 'password' : 'text'}
              value={formData[field.key] || ''} 
              onChange={handleChange} 
              required 
            />
          </Grid>
        ))}
      </Grid>
      <Button type="submit" variant="contained" sx={{ mt: 3 }}>
        Generate Officer Account
      </Button>
    </form>
  </CardContent>
</Card>

      <Paper sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Full Name</TableCell>
              <TableCell>Badge ID</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>District</TableCell>
              <TableCell>Phone</TableCell>
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

      <Snackbar open={openSnackbar} autoHideDuration={4000} onClose={() => setSnackbar(false)}>
        <Alert severity="success">Officer account generated successfully!</Alert>
      </Snackbar>
    </Box>
  );
}