import React from 'react';
import { useLocation, Link as RouterLink } from 'react-router-dom';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Tooltip,
  ListItemButton,
  Badge,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Description as DocumentsIcon,
  GavelRounded as AppealsIcon,
  CloudUpload as UploadIcon,
  DateRange as TrackingIcon,
  Person as ProfileIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
  BarChart as ReportingIcon,
  CreditCard as BillingIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  {
    text: 'Dashboard',
    icon: <DashboardIcon />,
    path: '/',
  },
  {
    text: 'Documents',
    icon: <DocumentsIcon />,
    path: '/documents',
  },
  {
    text: 'Appeals',
    icon: <AppealsIcon />,
    path: '/appeals',
  },
  {
    text: 'Appeal Tracking',
    icon: <Badge color="error" variant="dot" overlap="circular"><TrackingIcon /></Badge>,
    path: '/appeals/tracking',
  },
  {
    text: 'Reports & Analytics',
    icon: <ReportingIcon />,
    path: '/appeals/reporting',
  },
  {
    text: 'Upload',
    icon: <UploadIcon />,
    path: '/documents/upload',
  },
];

const accountItems = [
  {
    text: 'Profile',
    icon: <ProfileIcon />,
    path: '/profile',
  },
  {
    text: 'Billing',
    icon: <BillingIcon />,
    path: '/billing',
  },
  {
    text: 'Settings',
    icon: <SettingsIcon />,
    path: '/settings',
  },
  {
    text: 'Help',
    icon: <HelpIcon />,
    path: '/help',
  },
];

const Sidebar = ({ open }) => {
  const location = useLocation();
  const { user } = useAuth();
  
  const isCurrentPath = (path) => location.pathname === path;

  return (
    <>
      <List component="nav">
        {navItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              component={RouterLink}
              to={item.path}
              selected={isCurrentPath(item.path)}
              sx={{
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
                px: 2.5,
              }}
            >
              <Tooltip title={!open ? item.text : ''} placement="right">
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : 'auto',
                    justifyContent: 'center',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
              </Tooltip>
              <ListItemText 
                primary={item.text} 
                sx={{ 
                  opacity: open ? 1 : 0,
                  display: open ? 'block' : 'none'
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      {user && (
        <List>
          {accountItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
              <ListItemButton
                component={RouterLink}
                to={item.path}
                selected={isCurrentPath(item.path)}
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                }}
              >
                <Tooltip title={!open ? item.text : ''} placement="right">
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 3 : 'auto',
                      justifyContent: 'center',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                </Tooltip>
                <ListItemText 
                  primary={item.text} 
                  sx={{ 
                    opacity: open ? 1 : 0,
                    display: open ? 'block' : 'none'
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      )}
    </>
  );
};

export default Sidebar;