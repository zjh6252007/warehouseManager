import axios from "axios"
import { getToken,deleteToken } from "./token"
import { isTokenExpired } from "./auth"

//https://warehouse-eycbahh2a8dwgud5.eastus-01.azurewebsites.net
//http://localhost:443
const request = axios.create({
    baseURL:'https://warehouse-eycbahh2a8dwgud5.eastus-01.azurewebsites.net',
    timeout: 50000
})

// 防止重复跳转的标记
let isRedirecting = false;

request.interceptors.request.use((config)=>{
    const token = getToken();
    
    // 检查 token 是否过期
    if (token && isTokenExpired(token)) {
        deleteToken();
        // 如果 token 过期，取消请求并跳转到登录页
        if (!isRedirecting) {
            isRedirecting = true;
            // 使用 window.location 跳转，避免 React Router 的问题
            window.location.href = '/login';
        }
        return Promise.reject(new Error('Token expired'));
    }
    
  config.headers.Authorization= `Bearer ${token}`
  return config;
},(error)=>{
    return Promise.reject(error);
});


request.interceptors.response.use((response)=>{
    return response.data},
    (error)=>{
    // Fix: Check error.response exists before accessing status
    if(error.response && (error.response.status === 401 || error.response.status === 403)){
        deleteToken();
        // 当收到 401/403 时，跳转到登录页
        if (!isRedirecting) {
            isRedirecting = true;
            // 延迟一下，避免在请求过程中立即跳转
            setTimeout(() => {
                window.location.href = '/login';
            }, 100);
        }
    }

    return Promise.reject(error);
}
);
export {request}