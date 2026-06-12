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
import { clearAuth, parseJwtPayload, setAuth, setDriverContext, setOfficerProfile } from '../services/auth';

export default function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState('ADMIN');
  
  // For officers: input1 = email, input2 = password
  // For drivers: input1 = reference number, input2 = category identifier
  const [input1, setInput1] = useState('');
  const [input2, setInput2] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isDriver = role === 'DRIVER';

  const handleLogin = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      clearAuth();

      if (isDriver) {
        const token = input1.trim();
        if (!token) {
          alert('Please paste the access token given by the officer.');
          return;
        }

        // Temporarily store token so api client can call /auth/me
        setAuth({ accessToken: token, tokenType: 'Bearer', username: '', role: 'DRIVER', expiresInSeconds: 0 });
        const profile = await me();
        setAuth({ accessToken: token, tokenType: 'Bearer', username: profile.username, role: profile.role, expiresInSeconds: 0 });

        const payload = parseJwtPayload(token);
        const driverCtx = payload || {};
        setDriverContext(driverCtx);
        navigate('/driver', { state: driverCtx });
        return;
      }

      const data = await login({ username: input1, password: input2 });
      setAuth(data);

      // Preserve existing portal UX by saving context used by current pages
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
        alert('Driver access uses an officer-issued token. Choose DRIVER role and paste the token.');
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

            {/* FIELD 1 */}
            <TextField
              fullWidth
              label={isDriver ? "Access Token" : "Email Address"}
              placeholder={isDriver ? "Paste token from the officer" : "e.g., officer@police.lk"}
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

            {/* FIELD 2 */}
            {!isDriver ? (
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
            ) : null}

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
              Officer accounts are created by admins. Drivers sign in with an officer-issued token.
            </Typography>
          </form>

        </CardContent>
      </Card>
    </Box>
  );
}