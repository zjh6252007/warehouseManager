import { createBrowserRouter,Navigate } from "react-router-dom";
import Guard from "./guard";
import SignIn from "../pages/login";
import Dashboard from "../pages/Dashboard";
import Inventory from "../pages/Inventory";
import Store from "../pages/Store";
import Sales from "../pages/Sales";
import StoreDetail from "../pages/StoreDetail";
import Reports from "../pages/Reports";
import Profile from "../pages/Profile";
import StoreSetting from "../pages/StoreSetting";
import Delivery from "../pages/Delivery";
import ReturnLog from "../pages/ReturnLog";
const router = createBrowserRouter([
    {
    path:"/",
    element:<Guard><Dashboard/></Guard>,
    children:[
        {
            path: "/", 
            element: <Navigate to="/sales" />
          },
        {
            path:"/inventory",
            element:<Inventory/>
        },
        {
            path:"/store",
            element:<Store/>
        },
        {
            path:"/sales",
            element:<Sales/>
        },
        {
            path:"/profile",
            element:<Profile/>
        },
        {
            path:"/reports",
            element:<Reports/>
        },
        {
            path:"/delivery",
            element:<Delivery/>
        },
        {
            path:"/store/mystore/:storeId",
            element:<StoreDetail/>
        },
        {
            path:"/store/mystore/inventory/:storeId",
            element:<Inventory/>
        },
        {
            path:"/store/mystore/sales/:storeId",
            element:<Sales/>
        },
        {
            path:"/store/mystore/sales/reports/:storeId",
            element:<Reports/>
        },
        {
            path:"/store/mystore/settings/:storeId",
            element:<StoreSetting/>
        },
        {
            path:"/store/mystore/delivery/:storeId",
            element:<Delivery/>
        },
        {
            path:"/store/mystore/return/:storeId",
            element:<ReturnLog/>
        }
    ]
    },
    {
        path:"/login",
        element:<SignIn/>
    }
])

export default router;