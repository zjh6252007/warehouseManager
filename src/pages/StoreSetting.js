import * as React from 'react';
import { Grid, Paper, Typography, Button, Divider, TextField, Dialog, DialogActions, DialogContent, DialogTitle, DialogContentText } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchStoreDetail, updateStoreName, updateStoreAddress, updateStorePhone, switchTaxState, setTaxRate, updatepurchaseAgreement,deleteStore } from '../redux/modules/myStore';
import { updateLimitPercentage } from '../redux/modules/inventory';
const StoreSetting = () => {
    const dispatch = useDispatch();
    const { storeId } = useParams();
    const [open, setOpen] = useState(false);
    const [deleteWarning, setDeleteWarning] = useState(false);
    const [dialogTitle, setDialogTitle] = useState('');
    const [inputValue, setInputValue] = useState('');
    const [currentTaxRate, setCurrentTaxRate] = useState('');
    const [minPriceOpen, setMinPriceOpen] = useState(false);
    const [categoryData, setCategoryData] = useState([]);
    const nav = useNavigate();
    
    useEffect(() => {
        dispatch(fetchStoreDetail(storeId));
    }, [dispatch, storeId]);

    const storeInfo = useSelector(state => state.myStore.currentStore);
    const inventoryData = useSelector(state => state.inventory.inventoryList);
    const [agreementOpen, setAgreementOpen] = useState(false);
    const [purchaseAgreement, setPurchaseAgreement] = useState('');
    console.log(storeInfo);
    useEffect(() => {
        const categoryLimit = {};
        inventoryData.forEach(item => {
            if (!categoryLimit[item.category]) {
                categoryLimit[item.category] = item.limitPercentage;
            }
        });
        setCategoryData(Object.keys(categoryLimit).map(category => ({
            category,
            limitPercentage: categoryLimit[category]
        })));
    }, [inventoryData]);

    useEffect(()=> {
        if(storeInfo){
             setPurchaseAgreement(
                storeInfo.purchaseAgreement||
                       `TYPE1: Scratch and Dent Goods: Warranty within 30 Days After Purchase.
After 30 days: - Above delivery and service fees are not refundable.
For reasons other than functional issues, customers are responsible for sending appliances back to the store by themselves.
After the goods are received, the payment will be refunded according to the customer's payment method
(if customer need merchant pick up the returned goods at home, additional shipping fees will be charged).
Customers are responsible for any service fee / processing fee that may occur during the refund.

- Within the 30 days of purchase, please get in touch with the store if anything. When initializing a claim, please have the following information ready:
1. Invoice/Receipt from the store as Proof of Purchase
2. Item Name and Model Number (Ex. LG Refrigerator, Model LRMVS3006)

Each service request is subject to a $99 deductible. And service includes parts, service, and labor.
$99 Fee charged only due to failure of accessories and not due to failure of product.`
     );
   }
 }, [storeInfo]);

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

    const handleSubmitTaxRate = () => {
        dispatch(setTaxRate(storeId, currentTaxRate));
    };

    const handleClose = () => {
        setOpen(false);
        setMinPriceOpen(false);
    };

    const handleDeleteStore = () => {
        setDeleteWarning(true);
        nav("/");
        dispatch(deleteStore(storeId));
    };

    const handleSubmit = () => {
        if (dialogTitle === 'Change Store Name') {
            dispatch(updateStoreName(storeId, inputValue));
        }
        else if (dialogTitle === 'Change Store Address') {
            dispatch(updateStoreAddress(storeId, inputValue));
        } else if (dialogTitle === 'Change Phone Number') {
            dispatch(updateStorePhone(storeId, inputValue));
        }
        setOpen(false);
    };

    const handleMinPriceOpen = () => {
        setMinPriceOpen(true);
    };

    const handleLimitPercentageChange = (category, value) => {
        setCategoryData(prevData => prevData.map(item =>
            item.category === category ? { ...item, limitPercentage: value } : item
        ));
    };

    const handleMinPriceSubmit = () => {
        const updatedCategoryData = categoryData.map(item => ({
            category: item.category,
            limitPercentage: item.limitPercentage
        }));
        dispatch(updateLimitPercentage(updatedCategoryData,storeId));
        handleClose();
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
                    <Typography variant="h6">Taxes: {storeInfo.tax ? 'Enabled' : 'Disabled'}</Typography>
                    <Button variant="contained" onClick={handleEnableTax}>{storeInfo.tax ? 'Disable Tax' : 'Enable Tax'}</Button>
                </Grid>
                <Grid item xs={12}>
                    <Divider />
                </Grid>
                <Grid item xs={12} container alignItems="center" justifyContent="space-between">
                    <Typography variant="h6">Current Taxes Rate: {storeInfo.taxRate}%</Typography>
                    <TextField
                        variant="outlined"
                        label="Set Taxes Rate"
                        onChange={handleTaxRateChange}
                        value={currentTaxRate}
                    />
                    <Button variant="contained" onClick={handleSubmitTaxRate}>Submit Tax Rate</Button>
                </Grid>
                <Grid item xs={12}>
                    <Divider />
                </Grid>
                <Grid item xs={12} container alignItems="center" justifyContent="space-between">
                    <Typography variant="h6">Purchase Agreement</Typography>
                    <Button variant="contained" onClick={() => setAgreementOpen(true)}>
                        Modify
                    </Button>
                </Grid>
                <Grid item xs={12}>
            <Paper sx={{ padding: 2, minHeight: 100 }}>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                    {storeInfo.purchaseAgreement || purchaseAgreement}
                </Typography>
            </Paper>
            </Grid>
                <Grid item xs={12} container alignItems="center" justifyContent="space-between">
                    <Typography variant="h6"></Typography>
                    <Button variant="contained" onClick={handleDeleteStore} sx={{ backgroundColor: 'red', color: 'white', '&:hover': { backgroundColor: 'darkred' } }}>DELETE STORE</Button>
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
            <Dialog open={deleteWarning} onClose={handleClose}>
                <DialogTitle>{"DELETE STORE"}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this Store? This will delete all sales records and inventory associated with this Store.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleDeleteStore} color="secondary">
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog open={minPriceOpen} onClose={handleClose}>
                <DialogTitle>Set Minimum Price</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2}>
                        {categoryData.map(item => (
                            <React.Fragment key={item.category}>
                                <Grid item xs={6}>
                                    <Typography>{item.category}</Typography>
                                </Grid>
                                <Grid item xs={3}>
                                    <Typography>{item.limitPercentage}%</Typography>
                                </Grid>
                                <Grid item xs={3}>
                                    <TextField
                                        variant="outlined"
                                        value={item.limitPercentage}
                                        onChange={(e) => handleLimitPercentageChange(item.category, e.target.value)}
                                        sx={{ width: '80px' }}
                                    />
                                </Grid>
                            </React.Fragment>
                        ))}
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleMinPriceSubmit}>Submit</Button>
                </DialogActions>
            </Dialog>
            <Dialog
               open={agreementOpen}
               onClose={() => setAgreementOpen(false)}
               sx={{ '& .MuiDialog-paper': { width: "80vw", maxWidth: "800px" } }}
               disablePortal
               disableEnforceFocus
             >
               <DialogTitle>Edit Purchase Agreement</DialogTitle>
               <DialogContent>
                 <TextField
                   variant="outlined"
                   fullWidth
                   multiline
                   minRows={10}
                   value={purchaseAgreement}
                   onChange={(e) => setPurchaseAgreement(e.target.value)}
                   sx={{ width: "100%" }}
                 />
               </DialogContent>
               <DialogActions>
                 <Button onClick={() => setAgreementOpen(false)}>Cancel</Button>
                 <Button onClick={() => {
                     dispatch(updatepurchaseAgreement(storeId, purchaseAgreement));
                     setAgreementOpen(false);
                 }}>
                   Submit
                 </Button>
               </DialogActions>
           </Dialog>
        </Paper>
    );
};

export default StoreSetting;
