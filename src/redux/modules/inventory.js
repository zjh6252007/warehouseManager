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
        },
        removeInventoryItems(state, action) {
            const idList = action.payload;
            state.inventoryList = state.inventoryList.filter(item => !idList.includes(item.id));
        }
    }
})

const {setInventoryList,decreseInventoryQty,removeInventoryItems} = inventory.actions;

const getAllInventory = () =>async(dispatch)=>{
    const res = await request.get("/api/inventory/getAll");
    dispatch(setInventoryList(res.data));
    return res.data;
}

const addInventory = (data) => async (dispatch) => {
    const res = await request.post("/api/inventory/addInventory", data);
  
    if (res.code === 0) {
      // 直接调用 getInventoryById，因为 storeId 一定会传入
      await dispatch(getInventoryById(data.store.id));
    } else {
      console.error(res.message);
    }
  
    return res;
  };

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
        },
        timeout: 300000
    });
    if(res.code === 0){
        await dispatch(getInventoryById(storeId));
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

const deleteInventory = (idList)=>async(dispatch)=>{
    try{
        const res = await request.delete('/api/inventory/deleteInventory',{data:idList});
        dispatch(removeInventoryItems(idList));
        return res;
    }catch(error)
    {
        console.log(error);
    }
}
export {getAllInventory,getInventory,decreseInventoryQty,getInventoryById,uploadInventoryFile,updateLimitPercentage,deleteInventory,addInventory};
const inventoryReducer = inventory.reducer;
export default inventoryReducer