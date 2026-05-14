import { Box, Typography, Card, CardContent } from '@mui/material';

export default function OfficerPortal() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f1f5f9', p: 4 }}>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 4, color: '#1e293b' }}>
        Officer Dashboard
      </Typography>
      <Card elevation={3}>
        <CardContent>
          <Typography variant="h6">My Issued Fines</Typography>
          <Typography color="textSecondary">This table will show only the fines issued by this specific logged-in officer.</Typography>
        </CardContent>
      </Card>
    </Box>
  );
}