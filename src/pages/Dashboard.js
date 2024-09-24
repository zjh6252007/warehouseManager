import React, { useState, useEffect } from 'react';
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import MuiDrawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import MainListItems from '../components/listItems';
import { Outlet, useNavigate, useLocation, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getUserInfo, clearUserInfo } from '../redux/modules/user';
import { Popconfirm } from 'antd';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

// Copyright Component
function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      <Link color="inherit">
        WL APPLIANCES
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

// Drawer Width
const drawerWidth = 240;

// Styled AppBar with conditional styling based on drawer state
const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1, // Ensure AppBar is above the drawer
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth, // Shift AppBar when drawer is open
    width: `calc(100% - ${drawerWidth}px)`, // Adjust width accordingly
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

// Styled Drawer with conditional styling based on open state
const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    '& .MuiDrawer-paper': {
      position: 'relative',
      whiteSpace: 'nowrap',
      width: drawerWidth, // Set drawer width
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
      boxSizing: 'border-box',
      ...(!open && {
        overflowX: 'hidden', // Hide overflow when closed
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        width: theme.spacing(7), // Collapsed width
        [theme.breakpoints.up('sm')]: {
          width: theme.spacing(9), // Slightly wider on larger screens
        },
      }),
    },
  }),
);

// Default Theme
const defaultTheme = createTheme();

// Dashboard Component
export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { storeId } = useParams();

  // Fetch user info on component mount
  useEffect(() => {
    dispatch(getUserInfo());
  }, [dispatch]);

  // Select user info from Redux store
  const userInfo = useSelector(state => state.user.userInfo);
  const isShowStore = userInfo.role === "admin";

  // Access theme and define media query for mobile
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // Mobile if screen size is 'sm' or below

  // Drawer states
  const [desktopOpen, setDesktopOpen] = useState(true); // Drawer open state for desktop
  const [mobileOpen, setMobileOpen] = useState(false);  // Drawer open state for mobile

  // Title state for the AppBar
  const [title, setTitle] = useState("Dashboard");

  // Toggle function for drawer
  const toggleDrawer = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setDesktopOpen(!desktopOpen);
    }
  };

  // Handle navigation item click
  const handleItemClick = (title) => {
    setTitle(title);
    if (isMobile) {
      setMobileOpen(false); // Close mobile drawer after selection
    }
  };

  // Logout function with confirmation
  const logout = () => {
    dispatch(clearUserInfo());
    navigate('/login');
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />

        {/* AppBar */}
        <AppBar position="absolute" open={desktopOpen && !isMobile}>
          <Toolbar
            sx={{
              pr: '24px', // Keep right padding when drawer closed
            }}
          >
            {/* Menu Button */}
            <IconButton
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={toggleDrawer}
              sx={{
                marginRight: '36px',
                ...(desktopOpen && !isMobile && { display: 'none' }), // Hide on desktop when drawer is open
              }}
            >
              <MenuIcon />
            </IconButton>
            {/* Title */}
            <Typography
              component="h1"
              variant="h6"
              color="inherit"
              noWrap
              sx={{ flexGrow: 1 }}
            >
              {title}
            </Typography>
            {/* Logout Icon */}
            <IconButton color="inherit">
              <Popconfirm
                title="Log Out"
                description="Are you sure to log out?"
                okText="Yes"
                cancelText="No"
                placement="bottomRight"
                onConfirm={logout}
              >
                <AccountCircleIcon />
              </Popconfirm>
            </IconButton>
          </Toolbar>
        </AppBar>

        {/* Permanent Drawer for Desktop */}
        {!isMobile && (
          <Drawer variant="permanent" open={desktopOpen}>
            <Toolbar
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                px: [1],
              }}
            >
              {/* Close Drawer Button */}
              <IconButton onClick={toggleDrawer}>
                <ChevronLeftIcon />
              </IconButton>
            </Toolbar>
            <Divider />
            <List component="nav">
              <MainListItems isShowStore={isShowStore} onItemClick={handleItemClick} />
              <Divider sx={{ my: 1 }} />
            </List>
          </Drawer>
        )}

        {/* Temporary Drawer for Mobile */}
        {isMobile && (
          <MuiDrawer
            variant="temporary"
            open={mobileOpen}
            onClose={toggleDrawer}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile
            }}
            sx={{
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
          >
            <Toolbar
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                px: [1],
              }}
            >
              {/* Close Drawer Button */}
              <IconButton onClick={toggleDrawer}>
                <ChevronLeftIcon />
              </IconButton>
            </Toolbar>
            <Divider />
            <List component="nav">
              <MainListItems isShowStore={isShowStore} onItemClick={handleItemClick} />
              <Divider sx={{ my: 1 }} />
            </List>
          </MuiDrawer>
        )}

        {/* Main Content Area */}
        <Box
          component="main"
          sx={{
            backgroundColor: (theme) =>
              theme.palette.mode === 'light'
                ? theme.palette.grey[100]
                : theme.palette.grey[900],
            flexGrow: 1,
            height: '100vh',
            overflow: 'auto',
          }}
        >
          {/* Spacer for AppBar */}
          <Toolbar />
          {/* Content Container */}
          <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Grid container spacing={3}>
              {/* Nested Routes will render here */}
              <Outlet />
            </Grid>
            {/* Footer */}
            <Divider sx={{ mt: 4 }} />
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
              {'Copyright © '}
              <Link color="inherit">
                WL APPLIANCES
              </Link>{' '}
              {new Date().getFullYear()}
              {'.'}
            </Typography>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
