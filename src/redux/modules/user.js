import { createSlice } from "@reduxjs/toolkit";
import { getToken,deleteToken,setToken as _setToken } from "../../utils/token";
import { request } from "../../utils/axios";
const user = createSlice({
    name:'user',
    initialState:{
        userInfo:{},
        userList:[],
        token:getToken()||''
    },
    reducers:{
        setUserInfo(state,action){
            state.userInfo = action.payload;
        },
        setToken(state,action){
            state.token = action.payload;
            _setToken(action.payload);
        },
        setUserList(state,action){
            state.userList = action.payload
        },
        updateUserList(state,action){
            state.userList = [...state.userList,action.payload];
        },
        clearUserInfo(state){
            state.token='';
            deleteToken();
        }
    }
})

const {setUserInfo,setToken,clearUserInfo,setUserList,updateUserList} = user.actions;

const login = (data) => async(dispatch) =>{
    const res =  await request.post("/api/user/login",data,{headers:{
        'Content-Type':'application/json'
    }});
    if(res.code === 0){
        dispatch(setToken(res.data));
    }
    return res;
}

const getUserInfo = () =>async(dispatch,getState)=>{
    const token = getState().user.token;
    try{
    const res = await request.get("/api/user/profile",{
        headers:{
            'Authorization':`Bearer ${token}`
        }
    });
    dispatch(setUserInfo(res.data))
    return res;
    }
    catch(error){
        if(error.response && (error.response.status === 401 || error.response.status === 403)){
            dispatch(clearUserInfo());
        }
    }
}

const register = (data) =>async(dispatch) =>{
    try{
    const res = await request.post("/api/user/register",data);
    if(res.code === 0){
    dispatch(updateUserList(res.data));
    }
    return res;
    }catch(error)
    {
        console.log(error);
    }
}

const getUserList = (id) =>async(dispatch)=>{
    const res = await request.get(`/api/user/getUserList/${id}`);
    dispatch(setUserList(res.data));
}

const deleteUser = (id) =>async(dispatch)=>{
    const res = await request.delete(`api/user/deleteUser/${id}`);
    dispatch(updateUserList());
    return res;
}

const switchAccountState = (id,storeId) =>async(dispatch)=>{
    const res = await request.post(`api/user/changeAccountState?userId=${id}`);
    dispatch(getUserList(storeId));
    return res;
}

const changePassword = (data) =>async(dispatch)=>{
    const res = await request.post("/api/user/changePassword",data);
    return res;
}
export {login,getUserInfo,register,getUserList,clearUserInfo,deleteUser,switchAccountState,changePassword}

const userReducer = user.reducer;
export default userReducer;