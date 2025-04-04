import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Avatar,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import HelpIcon from '@mui/icons-material/Help';
import { useAuth } from '../../context/AuthContext';
import { logout } from '../../actions/authActions';

const Header = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null);
  
  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleNotificationsOpen = (event) => {
    setNotificationsAnchorEl(event.currentTarget);
  };
  
  const handleNotificationsClose = () => {
    setNotificationsAnchorEl(null);
  };
  
  const handleLogout = () => {
    handleMenuClose();
    dispatch(logout());
    navigate('/login');
  };
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      {/* Help Button */}
      <Tooltip title="Help & Resources">
        <IconButton color="inherit" size="large" sx={{ mr: 2 }}>
          <HelpIcon />
        </IconButton>
      </Tooltip>
      
      {/* Notifications */}
      <Tooltip title="Notifications">
        <IconButton 
          color="inherit" 
          size="large" 
          sx={{ mr: 2 }}
          onClick={handleNotificationsOpen}
        >
          <NotificationsIcon />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={notificationsAnchorEl}
        open={Boolean(notificationsAnchorEl)}
        onClose={handleNotificationsClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem sx={{ py: 1, minWidth: 250 }}>
          <Box>
            <Typography variant="subtitle2">Appeal Update</Typography>
            <Typography variant="body2" color="text.secondary">
              Your appeal for claim #123456 has been submitted
            </Typography>
          </Box>
        </MenuItem>
        <MenuItem sx={{ py: 1 }}>
          <Box>
            <Typography variant="subtitle2">Document Processed</Typography>
            <Typography variant="body2" color="text.secondary">
              Your EOB from BlueCross has been processed
            </Typography>
          </Box>
        </MenuItem>
        <MenuItem sx={{ py: 1 }}>
          <Box>
            <Typography variant="subtitle2">Appeal Success!</Typography>
            <Typography variant="body2" color="text.secondary">
              Your appeal for claim #789012 was approved
            </Typography>
          </Box>
        </MenuItem>
      </Menu>
      
      {/* User Profile */}
      <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={handleProfileMenuOpen}>
        <Avatar 
          sx={{ 
            width: 40, 
            height: 40,
            bgcolor: user?.firstName ? 'primary.main' : 'grey.500'
          }}
        >
          {user?.firstName ? user.firstName[0] + (user.lastName?.[0] || '') : 'U'}
        </Avatar>
        <Box sx={{ ml: 1, display: { xs: 'none', sm: 'block' } }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            {user?.firstName ? `${user.firstName} ${user.lastName}` : 'Guest'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {user?.role === 'provider' ? 'Healthcare Provider' : 'Patient'}
          </Typography>
        </Box>
      </Box>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem component={RouterLink} to="/profile" onClick={handleMenuClose}>
          Profile
        </MenuItem>
        <MenuItem component={RouterLink} to="/settings" onClick={handleMenuClose}>
          Settings
        </MenuItem>
        <MenuItem onClick={handleLogout}>Logout</MenuItem>
      </Menu>
    </Box>
  );
};

export default Header;