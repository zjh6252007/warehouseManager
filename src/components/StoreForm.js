import React, { useState } from 'react';
import { TextField, Button, Box } from '@mui/material';
import { createStore } from '../redux/modules/myStore';
import { useDispatch } from 'react-redux';

function StoreForm() {
    const [address, setAddress] = useState('');
    const [name,setName] = useState('');
    const [phone,setPhone] = useState('');
    const dispatch = useDispatch();
    const handleChange = (event) => {
        setAddress(event.target.value);
    };

    const handleChangeName = (event)=>{
        setName(event.target.value);
    }

    
    const handleChangePhone = (event)=>{
        setPhone(event.target.value);
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        dispatch(createStore({name,address,phone}));
    };

    return (
        <Box component="form" noValidate sx={{ mt: 1 }} onSubmit={handleSubmit}>
            <TextField
                margin="normal"
                required
                fullWidth
                id="address"
                label="Store Address"
                name="address"
                autoComplete="address"
                autoFocus
                value={address}
                onChange={handleChange}
            />

            <TextField
                margin="normal"
                required
                fullWidth
                id="storeName"
                label="Store Name"
                name="storeName"
                autoFocus
                value={name}
                onChange={handleChangeName}
            />

            <TextField
                margin="normal"
                required
                fullWidth
                id="phone"
                label="TelePhone"
                name="phone"
                autoFocus
                value={phone}
                onChange={handleChangePhone}
            />
            <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
            >
                Submit
            </Button>
        </Box>
    );
}

export default StoreForm;