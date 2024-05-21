import { createSlice } from "@reduxjs/toolkit";
import { request } from "../../utils/axios";

const delivery = createSlice({
    name:"delivery",
    initialState:{
        deliveryList:[]
    },
    reducers:
    {
        setDeliveryList(state,action){
            state.deliveryList = action.payload;
        }
    }
})

const {setDeliveryList} = delivery.actions;

const getDelivery = (storeId) => async(dispatch) =>{
    try{
    const res = await request.get(`/api/delivery/getAll/${storeId}`);
    dispatch(setDeliveryList(res.data));
    }catch(error)
    {
        console.log(error);
    }
}

const modifyDelivery = (id,deliveryData,storeId) =>async(dispatch)=>{
    try{
        const res = await request.post(`/api/delivery/update/${id}`,deliveryData);
        dispatch(getDelivery(storeId));
        return res;
    }catch(error)
    {
        console.log(error);
    }
}
export {getDelivery,modifyDelivery};

const deliveryReducer = delivery.reducer;
export default deliveryReducer;