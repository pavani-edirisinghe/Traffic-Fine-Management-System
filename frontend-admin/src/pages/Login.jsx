import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Card, CardContent, Typography, TextField, 
  Button, MenuItem, Select, FormControl, InputLabel, 
  InputAdornment, IconButton 
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { mockOfficers } from '../data/mockData';

export default function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState('ADMIN');
  const [credentials, setCredentials] = useState({ username: '', password: '' });

    const handleLogin = (e) => {
    e.preventDefault();
      
    if (role === 'OFFICER') {
      const foundOfficer = mockOfficers.find(
        (officer) => officer.email === credentials.username && officer.password === credentials.password
      );

      if (foundOfficer) {
        navigate('/officer', { state: { currentOfficer: foundOfficer } }); 
      } else {
        alert("Invalid Officer Email or Password"); 
      }
    } 
    else if (role === 'ADMIN') {
      navigate('/admin'); 
    } 
    else if (role === 'DRIVER') {
      navigate('/driver'); 
    }
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
                onChange={(e) => setRole(e.target.value)}
              >
                <MenuItem value="DRIVER">Driver (Public Citizen)</MenuItem>
                <MenuItem value="OFFICER">Traffic Police Officer</MenuItem>
                <MenuItem value="ADMIN">System Administrator</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Username or Reference No."
              variant="outlined"
              sx={{ mb: 3 }}
              required
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
            />

            <TextField
              fullWidth
              label="Password"
              type="password"
              variant="outlined"
              sx={{ mb: 4 }}
              required
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
            />

            <Button 
              type="submit" 
              fullWidth 
              variant="contained" 
              size="large"
              sx={{ py: 1.5, fontWeight: 'bold', fontSize: '1.1rem' }}
            >
              Sign In
            </Button>
          </form>

        </CardContent>
      </Card>
    </Box>
  );
}