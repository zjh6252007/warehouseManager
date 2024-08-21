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
        dispatch(setReturnLog(res.data));
        }catch(error)
        {
            console.log(error);
        }
}

export {getReturnLog}
const returnLogReducer = returnLog.reducer;

export default returnLogReducer;