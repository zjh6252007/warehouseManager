import axios from "axios"
import { getToken,deleteToken } from "./token"
//https://bk-warehouse.com
const request = axios.create({
    baseURL:'http://localhost:8080',
    timeout: 5000
})

request.interceptors.request.use((config)=>{
    const token = getToken() 
  config.headers.Authorization= `Bearer ${token}`
  return config;
},(error)=>{
    return Promise.reject(error);
});


request.interceptors.response.use((response)=>{
    return response.data},
    (error)=>{
    if(error.response && error.response.status === 401 || error.response.status === 403){
        deleteToken();
    }

    return Promise.reject(error);
}
);
export {request}