import * as React from 'react';
import { Box, Button, Container, Grid,ListItem ,Dialog,DialogTitle,DialogContent,DialogActions} from '@mui/material';
import StoreCard from '../components/StoreCard';
import StoreForm from '../components/StoreForm';
import { getStore } from '../redux/modules/myStore';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { setStoreId } from '../redux/modules/myStore';
  export default function Store() {
    const [open,setOpen] = React.useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    useEffect(()=>{
      dispatch(getStore())
    },[dispatch])
    
    const storeInfo = useSelector(state=>state.myStore.storeList);
    const handleOpen = () =>{
      setOpen(true);
    }
    const handleClose = () =>{
      setOpen(false);
    }
    
    const handleCardClick = (storeId) =>{
      const localStoreId = localStorage.getItem('store_id');
      if(storeId){
        dispatch(setStoreId(storeId));
      }else if(localStoreId){
        dispatch(setStoreId(localStoreId));
      }
      navigate(`/store/mystore/${storeId}`);
    }

    
    return (
      <Container>
      <Box sx={{display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%'}}>
      <Box sx={{
        display:'flex',
        justifyContent:'flex-end', 
        width: '100%', 
        mb: 4,
        mt: 4
        }}>
          <Button variant="contained" color="primary" onClick={handleOpen}>
            Create Store
          </Button>
      <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Create Store</DialogTitle>
            <DialogContent>
            <StoreForm/>
            </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
        </DialogActions>
      </Dialog>
        </Box>
        <Grid container spacing={{ xs: 1, sm: 2, md: 3 }} justifyContent="center">
          {storeInfo.map((store,index)=>(
            <Grid item xs={12} sm={6} md={4} key={store.id}>
                <StoreCard storeAddress={store.address} onClick={()=>handleCardClick(store.id)}></StoreCard>
            </Grid>
          ))}
        </Grid>
      </Box>
      </Container>
    );
  }
