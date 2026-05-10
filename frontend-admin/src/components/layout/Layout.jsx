import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Box, AppBar, Toolbar, Typography, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, CssBaseline } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import BarChartIcon from '@mui/icons-material/BarChart';

const drawerWidth = 260;

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();

  // Define the navigation architecture
  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Transactions', icon: <ReceiptLongIcon />, path: '/transactions' },
    { text: 'Analytics', icon: <BarChartIcon />, path: '/analytics' },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      {/* Top Navigation Bar */}
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, backgroundColor: '#1976d2' }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold', letterSpacing: 1 }}>
            Traffic Fine Admin Portal
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Side Navigation Drawer (Upgraded to Dark Mode) */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { 
            width: drawerWidth, 
            boxSizing: 'border-box',
            backgroundColor: '#1e293b', // Professional dark slate background
            color: '#f8fafc', // Light text
            borderRight: 'none'
          },
        }}
      >
        <Toolbar /> {/* Spacer */}
        <Box sx={{ overflow: 'auto', mt: 2 }}>
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  selected={location.pathname === item.path}
                  onClick={() => navigate(item.path)}
                  sx={{
                    mx: 1, // Margin to make the highlight look like a rounded button
                    borderRadius: 1,
                    mb: 0.5,
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      borderLeft: '4px solid #60a5fa', // Blue accent indicator
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    }
                  }}
                >
                  <ListItemIcon sx={{ color: location.pathname === item.path ? '#60a5fa' : '#94a3b8', minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: location.pathname === item.path ? 'bold' : 'medium' }} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Main Content Area */}
      {/* 2. Tell the main content area it can scroll vertically (overflowY: 'auto') */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, height: '100%', overflowY: 'auto' }}>
        <Toolbar /> {/* Spacer */}
        <Outlet /> 
      </Box>
    </Box>
  );
}