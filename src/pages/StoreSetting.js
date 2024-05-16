import * as React from 'react';
import { Grid, Paper, Typography, Button, Divider, TextField, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { fetchStoreDetail } from '../redux/modules/myStore';
import { updateStoreName,updateStoreAddress,updateStorePhone,switchTaxState,setTaxRate } from '../redux/modules/myStore';
import { useState } from 'react';
const StoreSetting = () => {

    const dispatch = useDispatch();
    const {storeId} = useParams();
    const [open, setOpen] = useState(false);
    const [dialogTitle, setDialogTitle] = useState('');
    const [inputValue, setInputValue] = useState('');
    const [currenttaxRate, setCurrentTaxRate] = useState('');
    useEffect(()=>{
        dispatch(fetchStoreDetail(storeId));
    },[dispatch,storeId])
    const storeInfo = useSelector(state=>state.myStore.currentStore);

    const handleEditStoreName = () => {
        setDialogTitle('Change Store Name');
        setInputValue(storeInfo.storeName);
        setOpen(true);
    };

    const handleEditStoreAddress = () => {
        setDialogTitle('Change Store Address');
        setInputValue(storeInfo.address);
        setOpen(true);
    };

    const handleEditPhone = () => {
        setDialogTitle('Change Phone Number');
        setInputValue(storeInfo.phone);
        setOpen(true);
    };

    const handleEnableTax = () => {
        dispatch(switchTaxState(storeId));
    };

    const handleTaxRateChange = (event) => {
        setCurrentTaxRate(event.target.value);
    };

    const handleSubmitTaxRate = () =>{
        dispatch(setTaxRate(storeId,currenttaxRate));
    }
    const handleClose = () => {
        setOpen(false);
    };

    const handleSubmit = () => {
        if (dialogTitle === 'Change Store Name') {
            dispatch(updateStoreName(storeId, inputValue));
        }
        else if (dialogTitle === 'Change Store Address') {
            dispatch(updateStoreAddress(storeId, inputValue));
        }else if(dialogTitle === 'Change Phone Number'){
            dispatch(updateStorePhone(storeId,inputValue));
        }
        setOpen(false);
    };

    if (!storeInfo) {
        return <Typography variant="h6">Loading...</Typography>;
    }


    return (
        <Paper elevation={3} sx={{ padding: 4 }}>
            <Grid container spacing={2}>
                <Grid item xs={12} container alignItems="center" justifyContent="space-between">
                    <Typography variant="h6">{storeInfo.storeName}</Typography>
                    <Button variant="contained" onClick={handleEditStoreName}>Change Store Name</Button>
                </Grid>
                <Grid item xs={12}>
                    <Divider />
                </Grid>

                <Grid item xs={12} container alignItems="center" justifyContent="space-between">
                    <Typography variant="h6">{storeInfo.address}</Typography>
                    <Button variant="contained" onClick={handleEditStoreAddress}>Change Store Address</Button>
                </Grid>
                <Grid item xs={12}>
                    <Divider />
                </Grid>

                <Grid item xs={12} container alignItems="center" justifyContent="space-between">
                    <Typography variant="h6">{storeInfo.phone}</Typography>
                    <Button variant="contained" onClick={handleEditPhone}>Change Phone</Button>
                </Grid>
                <Grid item xs={12}>
                    <Divider />
                </Grid>

                <Grid item xs={12} container alignItems="center" justifyContent="space-between">
                    <Typography variant="h6">Taxes:{storeInfo.tax?'Enabled':'Disabled'}</Typography>
                    <Button variant="contained" onClick={handleEnableTax}> {storeInfo.tax?'Disable Tax':'Enable Tax'} </Button>
                </Grid>
                <Grid item xs={12}>
                    <Divider />
                </Grid>

                <Grid item xs={12} container alignItems="center" justifyContent="space-between">
                    <Typography variant="h6">Current Taxes Rate:{storeInfo.taxRate}%</Typography>
                    <TextField
                        variant="outlined"
                        label="Set Taxes Rate"
                        onChange={handleTaxRateChange}
                        value={currenttaxRate}
                    />
                    <Button variant="contained" onClick={handleSubmitTaxRate}>Submit Tax Rate</Button>
                </Grid>
            </Grid>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>{dialogTitle}</DialogTitle>
                <DialogContent>
                    <TextField
                        variant="outlined"
                        fullWidth
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleSubmit}>Submit</Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
}

export default StoreSetting;