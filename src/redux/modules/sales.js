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
        }
    }
})

const {setSalesList,setSalesData} = sales.actions;

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

const getSalesByStoreId =(id) =>async(dispatch)=>{
    try{
        const res = await request.get(`/api/sales/getByStore?storeId=${id}`);
        dispatch(setSalesList(res.data))
        return res;
    }catch(error){
        console.log(error)
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
const returnSales = (returnList,storeId) =>async(dispatch)=>{
    try{
        const res = await request.delete(`/api/sales/return`,{
            data:returnList
        });
        dispatch(getSalesByStoreId(storeId));
        return res;
    }catch(error){
        console.log(error)
    }
}


export {postSales,getSalesByStoreId,deleteSales,getSalesByDate,returnSales}
const salesReducer = sales.reducer;
export default salesReducer;