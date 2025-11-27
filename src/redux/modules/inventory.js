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

const addInventory = (data, page = 0, pageSize = 20, keyword = "", userInfo = null, isStorePage = false) => async (dispatch) => {
    const res = await request.post("/api/inventory/addInventory", data);
  
    if (res.code === 0) {
      // 使用分页API刷新数据
      if (isStorePage || userInfo?.role === 'user') {
        await dispatch(getInventoryPagedByStore(data.store.id, page, pageSize, keyword));
      } else if (userInfo?.role === 'admin') {
        await dispatch(getInventoryPagedAdmin(page, pageSize, keyword));
      } else {
        // 回退到旧方法
        await dispatch(getInventoryById(data.store.id));
      }
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

const getInventoryPagedAdmin = (page = 0, size = 20, keyword = "", sortField = "uploadDate", sortDirection = "desc") => async (dispatch) => {
    try {
        const res = await request.get("/api/inventory/searchAdmin", {
            params: { page, size, keyword, sortField, sortDirection }
        });
        dispatch(setInventoryList(res.data.content));
        return res.data;
    } catch (error) {
        console.log(error);
    }
};

const getInventoryPagedByStore = (storeId, page = 0, size = 20, keyword = "", sortField = "uploadDate", sortDirection = "desc") => async (dispatch) => {
    try {
        const res = await request.get("/api/inventory/searchByStore", {
            params: { storeId, page, size, keyword, sortField, sortDirection }
        });
        dispatch(setInventoryList(res.data.content));
        return res.data;
    } catch (error) {
        console.log(error);
    }
};

const uploadInventoryFile=(file,storeId, page = 0, pageSize = 20, keyword = "") =>async(dispatch) =>{
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
        await dispatch(getInventoryPagedByStore(storeId, page, pageSize, keyword));
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
export {getAllInventory,getInventory,decreseInventoryQty,getInventoryById,uploadInventoryFile,updateLimitPercentage,deleteInventory,addInventory,getInventoryPagedAdmin,getInventoryPagedByStore};
const inventoryReducer = inventory.reducer;
export default inventoryReducer