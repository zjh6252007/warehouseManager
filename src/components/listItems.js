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
import { Button, ListItem } from '@mui/material';
import { DeleteOutline } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { Modal,List,Typography,Pagination } from 'antd';
import { removeFromCart } from '../redux/modules/cart';
import { getUserInfo } from '../redux/modules/user';
import { clearCart } from '../redux/modules/cart';
export default function MainListItems({isShowStore,onItemClick}){
  /* eslint-disable */
  const dispatch = useDispatch();
  const [open,setOpen] = useState(false);
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
  return (
  <React.Fragment>

      <ListItem>
      {!isShowStore &&(
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
        <Modal
      title="Create Order"
      open={open}
      onCancel={handleClose}
      footer={null}
      width="80vw"
      style={{ left: '10vh' }} 
      destroyOnClose
    >
    <div className="container" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
    <div className="leftPanel" style={{ flex:'75%', margin: '10px' }}>
      <ProductForm handleClose={handleClose}/>
    </div>

    <div className="rightPanel" style={{ flex: '25%', margin: '10px' }}>
    <List
      header={<div style={{textAlign:'center'}}>Cart</div>}
      bordered
      dataSource={currentItems}
      renderItem={(item) => (
        <List.Item style={{display:'flex',justifyContent:`space-between`}}>
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
    </ListItem>
    {!isStorePage?(<>
    {isShowStore &&(
    <ListItemButton component={Link} to="/store" onClick={()=>onItemClick("Store")}>
        <ListItemIcon>
          <StoreIcon />
        </ListItemIcon>
        <ListItemText primary="Store" />
      </ListItemButton>
    )}
          <ListItemButton component={Link} to={`/sales`} onClick={()=>onItemClick("Sales")}>
          <ListItemIcon>
            <ShoppingCartIcon />
          </ListItemIcon>
          <ListItemText primary="Sales" />
        </ListItemButton>

    <ListItemButton component={Link} to="/inventory" onClick={()=>onItemClick("Inventory")} >
      <ListItemIcon>
        <InventoryIcon />
      </ListItemIcon>
      <ListItemText primary="Inventory"  />
    </ListItemButton>
    
    {!isShowStore &&(<ListItemButton component={Link} to="/delivery" onClick={()=>onItemClick("delivery")} >
      <ListItemIcon>
        <LocalShippingIcon />
      </ListItemIcon>
      <ListItemText primary="Delivery"  />
    </ListItemButton>
    )}

    {isShowStore &&(
    <ListItemButton component={Link} to = {`/reports`} onClick={()=>onItemClick("Reports")}>
    <ListItemIcon>
      <SummarizeIcon />
    </ListItemIcon>
    <ListItemText primary="Reports" />
  </ListItemButton>
    )}

    <ListItemButton component={Link} to="/profile" onClick={()=>onItemClick("Profile")}>
        <ListItemIcon>
          <AccountCircleIcon />
        </ListItemIcon>
        <ListItemText primary="Profile" />
      </ListItemButton>
</>):(<>
  <Button
        variant="contained"
        color="primary"
        size="large" 
        sx={{ width: '100%', maxWidth: 360, fontSize: '1.1rem', py: 1.5 }} 
        onClick={handleOpen}
      >
        Create Order
      </Button>

  <ListItemButton component={Link} to="/store/" onClick={()=>onItemClick("Store")}>
      <ListItemIcon>
        <ArrowBackIcon />
      </ListItemIcon>
      <ListItemText primary="Back" />
    </ListItemButton>

    <ListItemButton component={Link} to={`/store/mystore/${store_id}`} >
      <ListItemIcon>
        <AccountCircleIcon />
      </ListItemIcon>
      <ListItemText primary="Manage Account"  />
    </ListItemButton>

  <ListItemButton component={Link} to={`/store/mystore/inventory/${store_id}`} onClick={()=>onItemClick("Inventory")} >
      <ListItemIcon>
        <InventoryIcon />
      </ListItemIcon>
      <ListItemText primary="Store Inventory"  />
    </ListItemButton>

    <ListItemButton component={Link} to={`/store/mystore/sales/${store_id}`} onClick={()=>onItemClick("Sales")}>
      <ListItemIcon>
        <BarChartIcon />
      </ListItemIcon>
      <ListItemText primary="Sales" />
    </ListItemButton>
    <ListItemButton component={Link} to={`/store/mystore/delivery/${store_id}`} onClick={()=>onItemClick("Delivery")}>
      <ListItemIcon>
        <LocalShippingIcon />
      </ListItemIcon>
      <ListItemText primary="Delivery" />
    </ListItemButton>

    <ListItemButton component={Link} to = {`/store/mystore/sales/reports/${store_id}`} onClick={()=>onItemClick("Reports")}>
      <ListItemIcon>
        <SummarizeIcon />
      </ListItemIcon>
      <ListItemText primary="Reports" />
    </ListItemButton>

    <ListItemButton component={Link} to = {`/store/mystore/settings/${store_id}`} onClick={()=>onItemClick("Settings")}>
      <ListItemIcon>
        <SettingsIcon />
      </ListItemIcon>
      <ListItemText primary="Store Settings" />
    </ListItemButton>
</>)}
  </React.Fragment>)
};

