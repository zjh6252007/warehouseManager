import { createSlice } from "@reduxjs/toolkit";
import { request } from "../../utils/axios";
const myStore = createSlice({
    name:'myStore',
    initialState:{
        storeList:[],
        currentStore:null,
        storeid:localStorage.getItem('store_id')||null
    },
    reducers:{
        setStoreList(state,action){
            state.storeList = action.payload;
        },
        updateStoreList(state,action){
            state.storeList = [...state.storeList,action.payload]
        },
        setCurrentStore(state,action){
            state.currentStore = action.payload;
        },
        setStoreId(state,action){
            state.storeid = action.payload;
            localStorage.setItem('store_id',action.payload);
        }
    }
})
const {setStoreList,updateStoreList,setCurrentStore,setStoreId} = myStore.actions;

const getStore = () =>async(dispatch) =>{
    const res = await request.get("/api/store/get");
    dispatch(setStoreList(res.data));
}

const createStore = (data)=>async(dispatch) =>{
    const res = await request.post("/api/store/create",data);
    dispatch(updateStoreList(res.data));
}

const fetchStoreDetail = (storeId) =>async(dispatch)=>{
try{
    const res = await request.get(`/api/store/${storeId}`,{
        headers:{
            'Content-Type':'application/json'
        }
    });
    if(res.code === 0){
    dispatch(setCurrentStore(res.data));
    return res;}
    else{
        dispatch(setCurrentStore(null));
        return res;
    }
}catch(error){
    console.error(error);
}
}

const updateStoreName = (storeId, storeName) => async (dispatch) => {
    const res = await request.post('/api/store/updateStoreName', { storeId, storeName });
    dispatch(fetchStoreDetail(storeId));
    return res;
}

const updateStoreAddress = (storeId, address) => async (dispatch) => {
    console.log(storeId)
    const res = await request.post('/api/store/updateStoreAddress',{ storeId, address});
    dispatch(fetchStoreDetail(storeId));
    return res;
}
const updateStorePhone = (storeId, phone) => async (dispatch) => {
    const res = await request.post('/api/store/updateStorePhone', { storeId, phone });
    dispatch(fetchStoreDetail(storeId));
    return res;
}

const switchTaxState=(storeId) =>async(dispatch)=>{
    const res = await request.post(`/api/store/changeTaxState?storeId=${storeId}`);
    dispatch(fetchStoreDetail(storeId));
    return res;
}

const setTaxRate = (storeId,tax) =>async(dispatch)=>{
    const res = await request.post('/api/store/setTax',{storeId,tax});
    dispatch(fetchStoreDetail(storeId));
    return res;
}

const deleteStore = (id) =>async()=>{
    try{
        const res = await request.delete(`/api/store/${id}`)
        return res;
    }catch(error){
        console.log(error)
    }
}
export {getStore,createStore,fetchStoreDetail,setStoreId,updateStoreName,updateStoreAddress,updateStorePhone,switchTaxState,setTaxRate,deleteStore}
const myStoreReducer = myStore.reducer;
export default myStoreReducer;