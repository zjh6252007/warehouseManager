import { getToken } from "../utils/token";
import {Navigate} from 'react-router-dom'
function Guard({children}){
    const token = getToken();
    if(token){
        return <>{children}</>;
    }else{
        return(
            <Navigate to ={'/login'} replace/>
        )
    }
}

export default Guard;