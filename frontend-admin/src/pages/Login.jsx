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
import CommuteIcon from '@mui/icons-material/Commute';
import { mockOfficers } from '../data/mockData';

export default function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState('ADMIN');
  
  // For officers: input1 = email, input2 = password
  // For drivers: input1 = reference number, input2 = category identifier
  const [input1, setInput1] = useState('');
  const [input2, setInput2] = useState('');

  const isDriver = role === 'DRIVER';

  const handleLogin = (e) => {
    e.preventDefault();
      
    if (role === 'OFFICER') {
      const foundOfficer = mockOfficers.find(
        (officer) => officer.email === input1 && officer.password === input2
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
      navigate('/driver', { 
        state: { 
          referenceNumber: input1, 
          categoryIdentifier: input2 
        } 
      }); 
    }
  };

  const handleRoleChange = (e) => {
    setRole(e.target.value);
    setInput1('');
    setInput2('');
  };

  // Pre-defined categories for the dropdown
  const violationCategories = [
    { id: 'SPEEDING_OVER_20', name: 'Speeding' },
    { id: 'ILLEGAL_PARKING', name: 'Illegal Parking' },
    { id: 'NO_LICENSE', name: 'Driving Without License' },
    { id: 'RECKLESS_DRIVING', name: 'Reckless Driving' }
  ];

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

            {/* DYNAMIC FIELD 1: Email */}
            <TextField
              fullWidth
              label={isDriver ? "Reference Number" : "Email Address"}
              placeholder={isDriver ? "e.g., FIN-2026-8901" : "e.g., officer@police.lk"}
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

            {/* DYNAMIC FIELD 2: Password (Text) OR Category (Dropdown) */}
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
              sx={{ py: 1.5, fontWeight: 'bold', fontSize: '1.1rem' }}
            >
              {isDriver ? "Search Ticket" : "Sign In"}
            </Button>
          </form>

        </CardContent>
      </Card>
    </Box>
  );
}