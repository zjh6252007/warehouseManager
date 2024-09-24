import { getToken } from "../utils/token";
import {Navigate, useNavigate} from 'react-router-dom'
import {Modal,Button,Spin} from 'antd'
import { getToken } from "../utils/token";
import { isTokenExpired } from "../utils/auth";

function Guard({children}){
    const token = getToken();
    const [isExpired,setIsExpired] = useState(false);
    const [checking,setChecking] = useState(true);
    const navigate = useNavigate();

    con
    if(token){
        return <>{children}</>;
    }else{
        return(
            <Navigate to ={'/login'} replace/>
        )
    }
}

export default Guard;