import { createSlice } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from 'uuid'; 
import moment from "moment/moment";
const cart = createSlice({
    name:'cart',
    initialState:{
        cartList:[]
    },
    reducers:{
        addToCart(state,action){
            if (action.payload.deliveryDate) {
                action.payload.deliveryDate = moment(action.payload.deliveryDate).format('YYYY-MM-DD');
            }

            const itemWithId={
                ...action.payload,
                id:uuidv4()
            }
            state.cartList.push(itemWithId);
        },
        removeFromCart(state,action){
            state.cartList = state.cartList.filter(item=>item.id !== action.payload);
        },
        clearCart(state){
            state.cartList=[];
        }
    }
})

export const {addToCart,removeFromCart,clearCart}  = cart.actions;
const cartReducer = cart.reducer;

export default cartReducer;