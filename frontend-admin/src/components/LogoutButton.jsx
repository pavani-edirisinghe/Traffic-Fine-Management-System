import LogoutIcon from '@mui/icons-material/Logout';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { clearAuth } from '../services/auth';

export default function LogoutButton(props) {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate('/login', { replace: true });
  };

  return (
    <Button
      variant="outlined"
      color="inherit"
      startIcon={<LogoutIcon />}
      {...props}
      onClick={handleLogout}
    >
      Logout
    </Button>
  );
}
