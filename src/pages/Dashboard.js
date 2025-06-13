// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { styled, createTheme, ThemeProvider, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
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

// 常量：侧边栏宽度
const DESKTOP_DRAWER_WIDTH = 240;
const MOBILE_DRAWER_WIDTH = 64;

// Styled AppBar（保持不变）
const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: DESKTOP_DRAWER_WIDTH,
    width: `calc(100% - ${DESKTOP_DRAWER_WIDTH}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

// Styled permanent Drawer（desktop 用），collapsed 宽度仍由 styled 控制
const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  '& .MuiDrawer-paper': {
    position: 'relative',
    whiteSpace: 'nowrap',
    width: DESKTOP_DRAWER_WIDTH,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    boxSizing: 'border-box',
    ...(!open && {
      overflowX: 'hidden',
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      width: theme.spacing(7),      // 折叠时的窄宽度
      [theme.breakpoints.up('sm')]: {
        width: theme.spacing(9),    // 稍微宽一点
      },
    }),
  },
}));

const defaultTheme = createTheme();

// 版权组件（不变）
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

export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { storeId } = useParams();

  // 主题 & 响应式
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Drawer 状态：desktopOpen 仅影响桌面端；mobileOpen 仅影响手机端
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  // 标题栏文字
  const [title, setTitle] = useState('Dashboard');

  // 拉取用户信息
  useEffect(() => {
    dispatch(getUserInfo());
  }, [dispatch]);

  const userInfo = useSelector(state => state.user.userInfo);
  const isShowStore = userInfo.role === 'admin';

  // 切换 Drawer
  const toggleDrawer = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setDesktopOpen(!desktopOpen);
    }
  };

  // 菜单点击，设置标题，手机端自动收起
  const handleItemClick = (newTitle) => {
    setTitle(newTitle);
    if (isMobile) setMobileOpen(false);
  };

  // 登出
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
          <Toolbar sx={{ pr: '24px' }}>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={toggleDrawer}
              sx={{
                marginRight: '36px',
                ...(desktopOpen && !isMobile && { display: 'none' }),
              }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              component="h1"
              variant="h6"
              color="inherit"
              noWrap
              sx={{ flexGrow: 1 }}
            >
              {title}
            </Typography>
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

        {/* 桌面端：永久 Drawer */}
        {!isMobile && (
          <Drawer
            variant="permanent"
            open={desktopOpen}
            sx={{
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: desktopOpen
                  ? DESKTOP_DRAWER_WIDTH
                  : theme.spacing(9),
                overflowX: 'hidden',
              },
            }}
          >
            <Toolbar sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              px: [1],
            }}>
              <IconButton onClick={toggleDrawer}>
                <ChevronLeftIcon />
              </IconButton>
            </Toolbar>
            <Divider />
            <List component="nav">
              <MainListItems
                isShowStore={isShowStore}
                onItemClick={handleItemClick}
                isMobile={false}
              />
              <Divider sx={{ my: 1 }} />
            </List>
          </Drawer>
        )}

        {/* 手机端：临时 Drawer */}
        {isMobile && (
          <MuiDrawer
            variant="temporary"
            open={mobileOpen}
            onClose={toggleDrawer}
            ModalProps={{ keepMounted: true }}
            sx={{
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: MOBILE_DRAWER_WIDTH,
              },
            }}
          >
            <Toolbar sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              px: [1],
            }}>
              <IconButton onClick={toggleDrawer}>
                <ChevronLeftIcon />
              </IconButton>
            </Toolbar>
            <Divider />
            <List component="nav">
              <MainListItems
                isShowStore={isShowStore}
                onItemClick={handleItemClick}
                isMobile={true}
              />
              <Divider sx={{ my: 1 }} />
            </List>
          </MuiDrawer>
        )}

        {/* 主内容区 */}
        <Box
          component="main"
          sx={{
            backgroundColor: theme.palette.mode === 'light'
              ? theme.palette.grey[100]
              : theme.palette.grey[900],
            flexGrow: 1,
            height: '100vh',
            overflow: 'auto',
          }}
        >
          <Toolbar />
          <Container
            maxWidth={false}
            sx={{
              mt: 2,
              mb: 2,
              px: isMobile ? 2 : 4,
            }}
          >
            <Grid container spacing={1}>
              <Outlet />
            </Grid>
            <Copyright sx={{ pt: 4 }} />
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
