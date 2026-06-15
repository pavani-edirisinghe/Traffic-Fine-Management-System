import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Card, CardContent, Typography, TextField, 
  Button, MenuItem, Select, FormControl, InputLabel, 
  InputAdornment
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import EmailIcon from '@mui/icons-material/Email';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { mockOfficers } from '../data/mockData';
import { login, me } from '../services/api';
import { clearAuth, setAuth, setDriverContext, setOfficerProfile } from '../services/auth';

export default function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState('ADMIN');
  
  // For officers/admins: input1 = username, input2 = password
  // For drivers: input1 = reference number (input2 is not used)
  const [input1, setInput1] = useState('');
  const [input2, setInput2] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isDriver = role === 'DRIVER';

  const handleLogin = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      clearAuth();

      // Driver Login Flow
      if (isDriver) {
        const refNumber = input1.trim();
        
        if (!refNumber) {
          alert('Please enter your Reference Number.');
          return;
        }

        // Set a basic driver session context so the driver portal can fetch the fine
        const driverCtx = { referenceNumber: refNumber };
        
        // Temporarily assign a placeholder token/role so the frontend knows a driver is "logged in"
        setAuth({ accessToken: 'driver-session-active', tokenType: 'Bearer', username: 'Driver', role: 'DRIVER', expiresInSeconds: 0 });
        setDriverContext(driverCtx);
        
        navigate('/driver', { state: driverCtx });
        return;
      }

      // Officer/Admin Login Flow
      const data = await login({ username: input1, password: input2 });
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

    } catch (error) {
      console.error('Login failed:', error);
      clearAuth();
      alert('Login failed. Check credentials and try again.');
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
      backgroundColor: '#0f172a' 
    }}>
      <Card elevation={6} sx={{ width: '100%', maxWidth: 400, borderRadius: 2 }}>
        <CardContent sx={{ p: 4 }}>
          
          {/* Header */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
            <Box sx={{ 
              bgcolor: 'primary.main', 
              color: 'white', 
              p: 1.5, 
              borderRadius: '50%', 
              mb: 2 
            }}>
              <LockOutlinedIcon fontSize="large" />
            </Box>
            <Typography variant="h5" fontWeight="bold">
              System Login
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Traffic Fine Management Portal
            </Typography>
          </Box>

          {/* Login Form */}
          <form onSubmit={handleLogin}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Account Role</InputLabel>
              <Select
                value={role}
                label="Account Role"
                onChange={handleRoleChange}
              >
                <MenuItem value="DRIVER">Driver (Public Citizen)</MenuItem>
                <MenuItem value="OFFICER">Traffic Police Officer</MenuItem>
                <MenuItem value="ADMIN">System Administrator</MenuItem>
              </Select>
            </FormControl>

            {/* FIELD 1: Username OR Reference Number */}
            <TextField
              fullWidth
              label={isDriver ? "Reference Number" : "Username"}
              placeholder={isDriver ? "e.g., TF-2026-2F4C1B" : "Enter your username"}
              variant="outlined"
              sx={{ mb: isDriver ? 4 : 3 }} // Extra margin if it's the only field
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

            {/* FIELD 2: Password (HIDDEN FOR DRIVER) */}
            {!isDriver && (
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
              Sign In
            </Button>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, textAlign: 'center' }}>
              {isDriver 
                ? "Drivers can sign in using only their fine Reference Number." 
                : "Officer accounts are created by admins."}
            </Typography>
          </form>

        </CardContent>
      </Card>
    </Box>
  );
}