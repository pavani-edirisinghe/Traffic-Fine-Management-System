import { Box, Typography, Card, CardContent, TextField, Button } from '@mui/material';

export default function DriverPortal() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f1f5f9', p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 4, color: '#1e293b' }}>
        Driver Portal - Pay Fines
      </Typography>
      <Card elevation={3} sx={{ maxWidth: 500, width: '100%' }}>
        <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="body1" color="textSecondary">
            Enter your Reference Number to securely pay your traffic fine.
          </Typography>
          <TextField label="Reference No. (e.g., FIN-2026-8901)" variant="outlined" fullWidth />
          <Button variant="contained" size="large" sx={{ mt: 2 }}>Search Fine</Button>
        </CardContent>
      </Card>
    </Box>
  );
}