import { useState, useEffect } from "react";
import { getToken } from "../utils/token";
import { isTokenExpired } from "../utils/auth";
import { Navigate, useNavigate } from 'react-router-dom';
import { Modal, Button, Spin } from 'antd';

function Guard({ children }) {
    const [isExpired, setIsExpired] = useState(false);
    const [checking, setChecking] = useState(true);
    const [token, setToken] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchedToken = getToken();
        setToken(fetchedToken);
        if (fetchedToken && isTokenExpired(fetchedToken)) {
            setIsExpired(true);
        }
        setChecking(false);
    }, []);

    const handleReLogin = () => {
        navigate('/login', { replace: true });
    }

    if (checking) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Spin tip="加载中..." size="large" />
            </div>
        );
    }

    if (isExpired) {
        return (
            <>
                <Modal
                    title="Warning"
                    visible={isExpired}
                    footer={[
                        <Button key="login" type="primary" onClick={handleReLogin}>
                            Login
                        </Button>,
                    ]}
                    closable={false}
                    maskClosable={false}
                >
                    <p>Session Expired,Please login again</p>
                </Modal>
            </>
        );
    }

    if (token) {
        return <>{children}</>;
    } else {
        return <Navigate to='/login' replace />;
    }
}

export default Guard;
