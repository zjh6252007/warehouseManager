// src/components/MainListItems.jsx

import * as React from 'react';
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import {
  Button,
  ListItem,
  Tooltip,
  IconButton,
  useMediaQuery,
  useTheme
} from '@mui/material';

import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SummarizeIcon from '@mui/icons-material/Summarize';
import BarChartIcon from '@mui/icons-material/BarChart';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import StoreIcon from '@mui/icons-material/Store';
import SettingsIcon from '@mui/icons-material/Settings';
import { DeleteOutline, AddShoppingCart } from '@mui/icons-material';
import { CloseOutlined } from '@ant-design/icons';

import { Modal, Drawer, List, Typography, Pagination } from 'antd';
import { getUserInfo } from '../redux/modules/user';
import { clearCart, removeFromCart } from '../redux/modules/cart';
import ProductForm from './ProductForm';

export default function MainListItems({ isShowStore, onItemClick }) {
  const dispatch = useDispatch();
  const location = useLocation();
  const isStorePage = location.pathname.includes('/mystore');

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [open, setOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const cartInfo = useSelector(state => state.cart.cartList);
  const currentItems = cartInfo.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const store_id = useSelector(state => state.myStore.storeid);

  useEffect(() => {
    dispatch(getUserInfo());
  }, [dispatch]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    dispatch(clearCart());
    setOpen(false);
  };
  const handleRemoveItem = id => dispatch(removeFromCart(id));

  const renderOrderForm = () => {
    if (isMobile) {
      return (
        <Drawer
          title={
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0 16px'
              }}
            >
              <span>Create Order</span>
              <IconButton onClick={handleClose} size="large">
                <CloseOutlined />
              </IconButton>
            </div>
          }
          open={open}
          onClose={handleClose}
          placement="bottom"
          destroyOnClose
          height="100vh"               // 全屏高度
          bodyStyle={{                 // 禁止 Drawer 自带滚动
            padding: 0,
            height: '100%'
          }}
          maskStyle={{ touchAction: 'none' }}
        >
          {/* 整体滚动容器 */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              overflow: 'auto',
              paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)'
            }}
          >
            {/* 购物车区 */}
            <div
              style={{
                borderBottom: '1px solid #f0f0f0',
                padding: '16px'
              }}
            >
              <List
                header={
                  <div style={{ textAlign: 'center', fontWeight: 'bold' }}>
                    Cart ({cartInfo.length} items)
                  </div>
                }
                bordered
                dataSource={currentItems}
                size="small"
                renderItem={item => (
                  <List.Item
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between'
                    }}
                  >
                    <Typography.Text>
                      {item.type}: {item.model}
                      <br />
                      Price: ${item.price}
                    </Typography.Text>
                    <Button
                      type="primary"
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      <DeleteOutline />
                    </Button>
                  </List.Item>
                )}
              />
              {cartInfo.length > pageSize && (
                <Pagination
                  current={currentPage}
                  onChange={page => setCurrentPage(page)}
                  total={cartInfo.length}
                  pageSize={pageSize}
                  showSizeChanger={false}
                  size="small"
                  style={{ marginTop: 8, textAlign: 'center' }}
                />
              )}
            </div>

            {/* 表单区：加内边距 & 自适应居中 */}
            <div
              style={{
                flex: 1,
                padding: '0 16px',       // 两侧留白
                boxSizing: 'border-box'
              }}
            >
              <div
                style={{
                  width: '100%',
                  maxWidth: 600,         // 最大宽度
                  margin: '0 auto'       // 居中
                }}
              >
                <ProductForm handleClose={handleClose} />
              </div>
            </div>
          </div>
        </Drawer>
      );
    }

    // 桌面端 Modal
    return (
      <Modal
        title="Create Order"
        open={open}
        onCancel={handleClose}
        footer={null}
        width="80vw"
        centered
        destroyOnClose
      >
        <div
          style={{
            display: 'flex',
            gap: 20
          }}
        >
          <div
            style={{
              flex: '1 1 70%',
              minWidth: 0,
              padding: '0 16px',
              boxSizing: 'border-box'
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: 600,
                margin: '0 auto'
              }}
            >
              <ProductForm handleClose={handleClose} />
            </div>
          </div>
          <div style={{ flex: '0 0 30%', minWidth: 250 }}>
            <List
              header={<div style={{ textAlign: 'center' }}>Cart</div>}
              bordered
              dataSource={currentItems}
              renderItem={item => (
                <List.Item
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}
                >
                  <Typography.Text>
                    {item.type}: {item.model}
                    <br />
                    Price: ${item.price}
                  </Typography.Text>
                  <Button
                    type="primary"
                    onClick={() => handleRemoveItem(item.id)}
                  >
                    <DeleteOutline />
                  </Button>
                </List.Item>
              )}
            />
            <Pagination
              current={currentPage}
              onChange={page => setCurrentPage(page)}
              total={cartInfo.length}
              pageSize={pageSize}
              showSizeChanger={false}
            />
          </div>
        </div>
      </Modal>
    );
  };

  const renderMenuItem = (to, icon, text, onClick) => {
    if (isSmallMobile) {
      return (
        <Tooltip title={text} placement="right">
          <ListItemButton
            component={Link}
            to={to}
            onClick={() => onClick && onClick(text)}
            sx={{ justifyContent: 'center', px: 1 }}
          >
            <ListItemIcon sx={{ minWidth: 'auto' }}>{icon}</ListItemIcon>
          </ListItemButton>
        </Tooltip>
      );
    }
    return (
      <ListItemButton
        component={Link}
        to={to}
        onClick={() => onClick && onClick(text)}
      >
        <ListItemIcon>{icon}</ListItemIcon>
        <ListItemText primary={text} />
      </ListItemButton>
    );
  };

  return (
    <React.Fragment>
      <ListItem sx={{ px: isSmallMobile ? 1 : 2 }}>
        {!isShowStore && (
          isSmallMobile ? (
            <Tooltip title="Create Order" placement="right">
              <IconButton
                color="primary"
                size="large"
                onClick={handleOpen}
                sx={{
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': { backgroundColor: 'primary.dark' },
                  width: 48,
                  height: 48
                }}
              >
                <AddShoppingCart />
              </IconButton>
            </Tooltip>
          ) : (
            <Button
              variant="contained"
              color="primary"
              size="large"
              sx={{ width: '100%', maxWidth: 360, fontSize: '1.1rem', py: 1.5 }}
              onClick={handleOpen}
            >
              Create Order
            </Button>
          )
        )}
        {renderOrderForm()}
      </ListItem>

      {!isStorePage ? (
        <>
          {isShowStore && renderMenuItem('/store', <StoreIcon />, 'Store', onItemClick)}
          {renderMenuItem('/sales', <ShoppingCartIcon />, 'Sales', onItemClick)}
          {renderMenuItem('/inventory', <InventoryIcon />, 'Inventory', onItemClick)}
          {!isShowStore && renderMenuItem('/delivery', <LocalShippingIcon />, 'Delivery', onItemClick)}
          {isShowStore && renderMenuItem('/reports', <SummarizeIcon />, 'Reports', onItemClick)}
          {renderMenuItem('/profile', <AccountCircleIcon />, 'Profile', onItemClick)}
        </>
      ) : (
        <>
          <ListItem sx={{ px: isSmallMobile ? 1 : 2 }}>
            {isSmallMobile ? (
              <Tooltip title="Create Order" placement="right">
                <IconButton
                  color="primary"
                  size="large"
                  onClick={handleOpen}
                  sx={{
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '&:hover': { backgroundColor: 'primary.dark' },
                    width: 48,
                    height: 48
                  }}
                >
                  <AddShoppingCart />
                </IconButton>
              </Tooltip>
            ) : (
              <Button
                variant="contained"
                color="primary"
                size="large"
                sx={{ width: '100%', maxWidth: 360, fontSize: '1.1rem', py: 1.5 }}
                onClick={handleOpen}
              >
                Create Order
              </Button>
            )}
          </ListItem>

          {renderMenuItem('/store/', <ArrowBackIcon />, 'Back', onItemClick)}
          {renderMenuItem(`/store/mystore/${store_id}`, <AccountCircleIcon />, 'Manage Account')}
          {renderMenuItem(`/store/mystore/inventory/${store_id}`, <InventoryIcon />, 'Store Inventory', onItemClick)}
          {renderMenuItem(`/store/mystore/sales/${store_id}`, <BarChartIcon />, 'Sales', onItemClick)}
          {renderMenuItem(`/store/mystore/return/${store_id}`, <BarChartIcon />, 'Return Item', onItemClick)}
          {renderMenuItem(`/store/mystore/delivery/${store_id}`, <LocalShippingIcon />, 'Delivery', onItemClick)}
          {renderMenuItem(`/store/mystore/sales/reports/${store_id}`, <SummarizeIcon />, 'Reports', onItemClick)}
          {renderMenuItem(`/store/mystore/settings/${store_id}`, <SettingsIcon />, 'Store Settings', onItemClick)}
        </>
      )}
    </React.Fragment>
  );
}
