import { createSlice } from "@reduxjs/toolkit";
import { request } from "../../utils/axios";
const returnLog = createSlice({
    name:'returnLog',
    initialState:{
        returnLog:[]
    },
    reducers:{
        setReturnLog(state,action){
            state.returnLog = action.payload;
        }
    }
})

const {setReturnLog} = returnLog.actions;

const getReturnLog =(storeId)=>async(dispatch)=> {
    try{
        const res = await request.get(`/api/returnLog/getReturnLog/${storeId}`);
        if (res && res.code === 0 && res.data) {
            dispatch(setReturnLog(res.data));
        } else {
            dispatch(setReturnLog([]));
        }
        return res;
    }catch(error)
    {
        console.error('Error fetching return log:', error);
        dispatch(setReturnLog([]));
        // Don't throw error to prevent app crash
        return { code: 1, message: error.message || 'Failed to fetch return log', data: [] };
    }
}

const getOriginalReceipt = (invoiceNumber) => async (dispatch) => {
    try {
        const res = await request.get(`/api/returnLog/getOriginalReceipt/${invoiceNumber}`);
        if (res && res.code === 0 && res.data) {
            return res.data;
        } else {
            throw new Error(res?.message || 'Failed to get original receipt');
        }
    } catch (error) {
        console.error('Error fetching original receipt:', error);
        throw error;
    }
}

export {getReturnLog, getOriginalReceipt}
const returnLogReducer = returnLog.reducer;

export default returnLogReducer;