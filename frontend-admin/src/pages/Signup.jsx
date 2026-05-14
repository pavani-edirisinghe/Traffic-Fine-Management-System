import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, TextField,
  Button, MenuItem, Select, FormControl, InputLabel,
  InputAdornment,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import EmailIcon from '@mui/icons-material/Email';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import CommuteIcon from '@mui/icons-material/Commute';
import { mockOfficers } from '../data/mockData';
import { signup } from '../services/api';
import { clearAuth, setAuth, setDriverContext, setOfficerProfile } from '../services/auth';

export default function Signup() {
  const navigate = useNavigate();
  const [role, setRole] = useState('DRIVER');
  const [input1, setInput1] = useState('');
  const [input2, setInput2] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isDriver = role === 'DRIVER';

  const violationCategories = [
    { id: 'SPEEDING_OVER_20', name: 'Speeding' },
    { id: 'ILLEGAL_PARKING', name: 'Illegal Parking' },
    { id: 'NO_LICENSE', name: 'Driving Without License' },
    { id: 'RECKLESS_DRIVING', name: 'Reckless Driving' },
  ];

  const handleSignup = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      clearAuth();
      const data = await signup({ username: input1, password: input2, role });
      setAuth(data);

      if (data.role === 'OFFICER') {
        const foundOfficer = mockOfficers.find((o) => o.email === data.username);
        const officerProfile = foundOfficer || {
          id: data.username,
          name: data.username,
          email: data.username,
          district: 'Unknown',
        };
        setOfficerProfile(officerProfile);
        navigate('/officer', { state: { currentOfficer: officerProfile } });
        return;
      }

      if (data.role === 'ADMIN') {
        navigate('/admin');
        return;
      }

      if (data.role === 'DRIVER') {
        const driverCtx = { referenceNumber: input1, categoryIdentifier: input2 };
        setDriverContext(driverCtx);
        navigate('/driver', { state: driverCtx });
      }
    } catch (error) {
      console.error('Signup failed:', error);
      alert('Signup failed. Try a different username.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRoleChange = (e) => {
    setRole(e.target.value);
    setInput1('');
    setInput2('');
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0f172a',
    }}>
      <Card elevation={6} sx={{ width: '100%', maxWidth: 420, borderRadius: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
            <Box sx={{
              bgcolor: 'primary.main',
              color: 'white',
              p: 1.5,
              borderRadius: '50%',
              mb: 2,
            }}>
              <LockOutlinedIcon fontSize="large" />
            </Box>
            <Typography variant="h5" fontWeight="bold">
              Create Account
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Traffic Fine Management Portal
            </Typography>
          </Box>

          <form onSubmit={handleSignup}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Account Role</InputLabel>
              <Select value={role} label="Account Role" onChange={handleRoleChange}>
                <MenuItem value="DRIVER">Driver (Public Citizen)</MenuItem>
                <MenuItem value="OFFICER">Traffic Police Officer</MenuItem>
                <MenuItem value="ADMIN">System Administrator</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label={isDriver ? 'Reference Number' : 'Email Address'}
              placeholder={isDriver ? 'e.g., FIN-2026-8901' : 'e.g., officer@police.lk'}
              variant="outlined"
              sx={{ mb: 3 }}
              required
              value={input1}
              onChange={(e) => setInput1(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    {isDriver ? <ReceiptLongIcon color="action" /> : <EmailIcon color="action" />}
                  </InputAdornment>
                ),
              }}
            />

            {isDriver ? (
              <TextField
                select
                fullWidth
                label="Category Identifier"
                variant="outlined"
                sx={{ mb: 4 }}
                required
                value={input2}
                onChange={(e) => setInput2(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CommuteIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              >
                {violationCategories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.name} ({cat.id})
                  </MenuItem>
                ))}
              </TextField>
            ) : (
              <TextField
                fullWidth
                label="Password"
                placeholder="••••••••"
                type="password"
                variant="outlined"
                sx={{ mb: 4 }}
                required
                value={input2}
                onChange={(e) => setInput2(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={submitting}
              sx={{ py: 1.5, fontWeight: 'bold', fontSize: '1.1rem' }}
            >
              Create Account
            </Button>

            <Button
              fullWidth
              variant="text"
              onClick={() => navigate('/login')}
              sx={{ mt: 1.5, fontWeight: 'bold' }}
            >
              Back to login
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
