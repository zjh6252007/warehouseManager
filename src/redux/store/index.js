import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../modules/user";
import inventoryReducer from "../modules/inventory";
import myStoreReducer from "../modules/myStore";
import cartReducer from "../modules/cart";
import salesReducer from "../modules/sales";
import deliveryReducer from "../modules/delivery";
import returnLogReducer from "../modules/returnLog";


const store = configureStore({
    reducer:{
        user:userReducer,
        inventory:inventoryReducer,
        myStore:myStoreReducer,
        cart:cartReducer,
        sales:salesReducer,
        delivery:deliveryReducer,
        returnLog:returnLogReducer
    }
})

export default store;