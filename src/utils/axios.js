import axios from "axios"
import { getToken,deleteToken } from "./token"
//https://warehouse-eycbahh2a8dwgud5.eastus-01.azurewebsites.net
//http://localhost:8080
const request = axios.create({
    baseURL:'https://warehouse-eycbahh2a8dwgud5.eastus-01.azurewebsites.net',
    timeout: 50000
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