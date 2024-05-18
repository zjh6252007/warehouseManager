import { createSlice } from "@reduxjs/toolkit";
import { request } from "../../utils/axios";

const inventory = createSlice({
    name:'inventory',
    initialState:{
        inventoryList:[]
    },
    reducers:{
        setInventoryList(state,action){
            state.inventoryList = action.payload;
        }
    }
})

const {setInventoryList,decreseInventoryQty} = inventory.actions;


const getAllInventory = () =>async(dispatch)=>{
    const res = await request.get("/api/inventory/getAll");
    dispatch(setInventoryList(res.data));
    return res.data;
}

const getInventory = () =>async(dispatch) =>{
    const res = await request.get("/api/inventory/getInventory");
    dispatch(setInventoryList(res.data));
    return res.data;
}

const getInventoryById=(id)=>async(dispatch)=>{
    const res = await request.get(`/api/inventory/getInventory/${id}`);
    dispatch(setInventoryList(res.data));
    return res.data;
}

const uploadInventoryFile=(file,storeId) =>async(dispatch) =>{
    const formData = new FormData();
    formData.append('file',file);
    formData.append('storeId',storeId);
    const res = await request.post('/api/csv/upload',formData,{
        headers:{
            'Content-Type':'multipart/form-data'
        }
    });
    if(res.code === 0){
        dispatch(getAllInventory());
    }else{
        console.error('File upload failed',res.message);
    }
    return res;
}

const updateLimitPercentage = (data, storeId) => async (dispatch) => {
    try {
        const res = await request.post('/api/inventory/updateLimitPercentage', data,{
            params: {
                storeId: storeId
            }
        });
        if (res.code === 0) {
            dispatch(getInventoryById(storeId));
        } else {
            console.error('Update failed', res.message);
        }
    } catch (error) {
        console.error('Update failed', error);
    }
}

export {getAllInventory,getInventory,decreseInventoryQty,getInventoryById,uploadInventoryFile,updateLimitPercentage};
const inventoryReducer = inventory.reducer;
export default inventoryReducer