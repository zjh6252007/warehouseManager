import { jwtDecode } from 'jwt-decode';

export function isTokenExpired(token) {
    if (!token) return true;
    try {
        const { exp, nbf } = jwtDecode(token);

        if (!exp) return true; // 缺少过期时间

        const currentTime = Math.floor(Date.now() / 1000);
        const bufferTime = 60; // 60 秒缓冲时间

        // 检查 token 是否尚未生效
        if (nbf && currentTime + bufferTime < nbf) return true;

        // 检查 token 是否已过期
        return exp < (currentTime + bufferTime);
    } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('Invalid token:', error);
        }
        return true;
    }
}
