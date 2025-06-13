import * as React from 'react';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SummarizeIcon from '@mui/icons-material/Summarize';
import BarChartIcon from '@mui/icons-material/BarChart';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import StoreIcon from '@mui/icons-material/Store'
import ProductForm from './ProductForm';
import SettingsIcon from '@mui/icons-material/Settings';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button, ListItem, Tooltip, IconButton } from '@mui/material';
import { DeleteOutline, AddShoppingCart } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { Modal,List,Typography,Pagination, Drawer } from 'antd';
import { removeFromCart } from '../redux/modules/cart';
import { getUserInfo } from '../redux/modules/user';
import { clearCart } from '../redux/modules/cart';
import { useMediaQuery, useTheme } from '@mui/material';
import { CloseOutlined } from '@ant-design/icons';

export default function MainListItems({isShowStore,onItemClick}){
  /* eslint-disable */
  const dispatch = useDispatch();
  const [open,setOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // 检测是否为移动设备
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm')); // 检测是否为小屏幕手机
  
  const handleOpen = () =>{
    setOpen(true);
  }
  useEffect(() => {
    console.log('Modal open state changed:', open);
  }, [open]);
/* eslint-enable */
  useEffect(()=>{
    dispatch(getUserInfo());
  },[dispatch])
  const handleClose= ()=>{
    dispatch(clearCart());
   setOpen(false);
  }

  const handleRemoveItem = (id) => {
    dispatch(removeFromCart(id));
};
  const store_id = useSelector(state=>state.myStore.storeid);
  const [currentPage,setCurrentPage] = useState(1);
  const pageSize = 6;
  const indexOfLastItem = currentPage * pageSize;
  const indexOfFirstItem = indexOfLastItem - pageSize;
  const cartInfo = useSelector(state=>state.cart.cartList);
  const currentItems = cartInfo.slice(indexOfFirstItem, indexOfLastItem);
  const location = useLocation();
  const isStorePage = location.pathname.includes('/mystore');
  const [loading, setLoading] = useState(false);

  // 移动端使用 Drawer，桌面端使用 Modal
  const renderOrderForm = () => {
    if (isMobile) {
      return (
        <Drawer
          title={
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              paddingRight: '24px'
            }}>
              <span>Create Order</span>
              <Button 
                type="text" 
                onClick={handleClose}
                icon={<CloseOutlined />}
                style={{ 
                  fontSize: '16px',
                  color: '#666'
                }}
              >
                Close
              </Button>
            </div>
          }
          open={open}
          onClose={handleClose}
          width="100%"
          height="100%"
          placement="bottom"
          style={{ height: '100vh' }}
          closable={true}
          destroyOnClose
        >
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            height: '100%',
            overflow: 'auto'
          }}>
            {/* 移动端购物车放在顶部，可折叠 */}
            <div style={{ 
              borderBottom: '1px solid #f0f0f0', 
              marginBottom: '16px',
              paddingBottom: '16px' 
            }}>
              <List
                header={<div style={{textAlign:'center', fontWeight: 'bold'}}>Cart ({cartInfo.length} items)</div>}
                bordered
                dataSource={currentItems}
                size="small"
                renderItem={(item) => (
                  <List.Item style={{display:'flex',justifyContent:'space-between'}}>
                    <div>
                      <Typography.Text>{item.type}: {item.model} <br/> Price: ${item.price}</Typography.Text>
                    </div>
                    <Button type="primary" onClick={() => handleRemoveItem(item.id)}><DeleteOutline/></Button>
                  </List.Item>
                )}
              />
              {cartInfo.length > pageSize && (
                <Pagination
                  current={currentPage}
                  onChange={page=>setCurrentPage(page)}
                  total={cartInfo.length}
                  pageSize={pageSize}
                  showSizeChanger={false}
                  size="small"
                  style={{ marginTop: '8px', textAlign: 'center' }}
                />
              )}
            </div>
            
            {/* 产品表单 */}
            <div style={{ flex: 1, overflow: 'auto' }}>
              <ProductForm handleClose={handleClose}/>
            </div>
          </div>
        </Drawer>
      );
    } else {
      // 桌面端保持原有布局
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
          <div className="container" style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            width: '100%',
            gap: '20px'
          }}>
            <div className="leftPanel" style={{ flex:'1 1 70%', minWidth: 0 }}>
              <ProductForm handleClose={handleClose}/>
            </div>

            <div className="rightPanel" style={{ flex: '0 0 30%', minWidth: '250px' }}>
              <List
                header={<div style={{textAlign:'center'}}>Cart</div>}
                bordered
                dataSource={currentItems}
                renderItem={(item) => (
                  <List.Item style={{display:'flex',justifyContent:'space-between'}}>
                    <div>
                      <Typography.Text>{item.type}: {item.model} <br/> Price: ${item.price}</Typography.Text>
                    </div>
                    <Button type="primary" onClick={() => handleRemoveItem(item.id)}><DeleteOutline/></Button>
                  </List.Item>
                )}
              />
              <Pagination
                current={currentPage}
                onChange={page=>setCurrentPage(page)}
                total={cartInfo.length}
                pageSize={pageSize}
                showSizeChanger={false}
              />
            </div>
          </div>
        </Modal>
      );
    }
  };

  // 渲染菜单项的函数
  const renderMenuItem = (to, icon, text, onClick) => {
    if (isSmallMobile) {
      // 小屏幕只显示图标
      return (
        <Tooltip title={text} placement="right">
          <ListItemButton 
            component={Link} 
            to={to} 
            onClick={() => onClick && onClick(text)}
            sx={{ 
              justifyContent: 'center',
              px: 1 
            }}
          >
            <ListItemIcon sx={{ minWidth: 'auto' }}>
              {icon}
            </ListItemIcon>
          </ListItemButton>
        </Tooltip>
      );
    }
    
    // 正常显示图标和文字
    return (
      <ListItemButton component={Link} to={to} onClick={() => onClick && onClick(text)}>
        <ListItemIcon>
          {icon}
        </ListItemIcon>
        <ListItemText primary={text} />
      </ListItemButton>
    );
  };

  return (
  <React.Fragment>
      <ListItem sx={{ px: isSmallMobile ? 1 : 2 }}>
      {!isShowStore &&(
        isSmallMobile ? (
          <Tooltip title="Create Order" placement="right">
            <IconButton
              color="primary"
              size="large"
              onClick={handleOpen}
              sx={{ 
                backgroundColor: 'primary.main',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
                width: '48px',
                height: '48px'
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
    {!isStorePage?(<>
    {isShowStore && renderMenuItem("/store", <StoreIcon />, "Store", onItemClick)}
    {renderMenuItem("/sales", <ShoppingCartIcon />, "Sales", onItemClick)}
    {renderMenuItem("/inventory", <InventoryIcon />, "Inventory", onItemClick)}
    {!isShowStore && renderMenuItem("/delivery", <LocalShippingIcon />, "Delivery", onItemClick)}
    {isShowStore && renderMenuItem("/reports", <SummarizeIcon />, "Reports", onItemClick)}
    {renderMenuItem("/profile", <AccountCircleIcon />, "Profile", onItemClick)}
</>):(<>
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
            '&:hover': {
              backgroundColor: 'primary.dark',
            },
            width: '48px',
            height: '48px'
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

  {renderMenuItem("/store/", <ArrowBackIcon />, "Back", onItemClick)}
  {renderMenuItem(`/store/mystore/${store_id}`, <AccountCircleIcon />, "Manage Account", null)}
  {renderMenuItem(`/store/mystore/inventory/${store_id}`, <InventoryIcon />, "Store Inventory", onItemClick)}
  {renderMenuItem(`/store/mystore/sales/${store_id}`, <BarChartIcon />, "Sales", onItemClick)}
  {renderMenuItem(`/store/mystore/return/${store_id}`, <BarChartIcon />, "Return Item", onItemClick)}
  {renderMenuItem(`/store/mystore/delivery/${store_id}`, <LocalShippingIcon />, "Delivery", onItemClick)}
  {renderMenuItem(`/store/mystore/sales/reports/${store_id}`, <SummarizeIcon />, "Reports", onItemClick)}
  {renderMenuItem(`/store/mystore/settings/${store_id}`, <SettingsIcon />, "Store Settings", onItemClick)}
</>)}
  </React.Fragment>)
};