import { createSlice } from "@reduxjs/toolkit";
import { request } from "../../utils/axios";

const sales = createSlice({
    name:'sales',
    initialState:{
        salesList:[],
        salesData:[]
    },
    reducers:{
        setSalesList(state,action){
            state.salesList = action.payload;
        },
        setSalesData(state,action){
            state.salesData = action.payload;
        },
        clearSalesList(state) {
            state.salesList = [];
        },
    }
})

const {setSalesList,setSalesData,clearSalesList} = sales.actions;

const refreshSalesListAfterChange = (dispatch, userInfo, storeId, page = 0, size = 20, keyword = "") => {
    if (userInfo.role === 'user') {
      return dispatch(getSalesPagedByStore(userInfo.storeId, page, size, keyword));
    } else if (userInfo.role === 'admin' && storeId) {
      return dispatch(getSalesPagedByStore(storeId, page, size, keyword));
    } else if (userInfo.role === 'admin') {
      return dispatch(getSalesPagedAdmin(page, size, keyword));
    }
  };

const postSales = (data) => async(dispatch)=>{
try{
    const res = await request.post("/api/sales/add",data.cart,{
        headers:{
            'Content-Type':'application/json'
        }
    });
    dispatch(setSalesList(res.data));
    return res
}catch(error)
{
    console.log(error);
}
}

const deleteSales = (invoiceNumber,storeId) => async(dispatch)=>{
    try{
        const res = await request.delete(`/api/sales/delete?invoiceNumber=${invoiceNumber}&storeId=${storeId}`)
        return res;
    }catch(error){
        return error;
    }
}

const getSalesByDate =(date,storeId) =>async(dispatch) =>{
    try{
        const res = await request.get('/api/sales/range',{
            params:{
                start:date.start,
                end:date.end,
                storeId:storeId
            }
        });
        dispatch(setSalesData(res.data));
        return res;
    }catch(error){
        console.log(error)
    }
}
const returnSales = (returnList, storeId, userId, page = 0, pageSize = 20, keyword = "", userInfo, returnReason = "") =>async(dispatch)=>{ 
    try{
        const res = await request.post(`/api/sales/return`,{
                returnList,
                userId,
                returnReason
        });
        if (res.code === 0) {
            await refreshSalesListAfterChange(dispatch, userInfo, storeId, page, pageSize, keyword);
        }
        return res;
    }catch(error){
        console.log(error);
        throw error;
    }
}

const getAllSalesByRange =(date) =>async(dispatch) =>{
    try{
        const res = await request.get('/api/sales/getAllByRange',{
            params:{
                start:date.start,
                end:date.end
            }
        });
        dispatch(setSalesData(res.data));
        return res;
    }catch(error){
        console.log(error)
    }
}

const addAccessory = (data, storeId, page, pageSize, keyword, userInfo) => async (dispatch) => {
    try {
      const res = await request.post('/api/sales/addAccessory', data);
      await refreshSalesListAfterChange(dispatch, userInfo, storeId, page, pageSize, keyword);
      return res;
    } catch (error) {
      console.log(error);
    }
  };
  

  const setReceipt = (data, storeId, page, pageSize, keyword, userInfo) => async (dispatch) => {
    try {
      const res = await request.post('/api/sales/generateReceipt', data);
      await refreshSalesListAfterChange(dispatch, userInfo, storeId, page, pageSize, keyword);
      return res;
    } catch (error) {
      console.log(error);
    }
  };

const getSalesPagedAdmin = (page=0,size=20,keyword="")=>async(dispatch)=>{
    try{
        const res = await request.get("/api/sales/searchAdmin",{
            params:{page,size,keyword}
        });
        dispatch(setSalesList(res.data.content));
        return res.data;
    }catch(error){
        console.log(error);
    }
}

const getSalesPagedByStore = (storeId, page = 0, size = 20, keyword = "") => async (dispatch) => {
    try {
      const res = await request.get("/api/sales/searchByStore", {
        params: { storeId, page, size, keyword }
      });
      console.log(res.data);
      dispatch(setSalesList(res.data.content));
      return res.data;
    } catch (error) {
      console.log(error);
    }
  };

export {postSales,deleteSales,getSalesByDate,returnSales,getSalesPagedAdmin,getSalesPagedByStore,getAllSalesByRange,clearSalesList,addAccessory,setReceipt}
const salesReducer = sales.reducer;
export default salesReducer;