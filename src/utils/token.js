function setToken(token){
    localStorage.setItem('loginToken',token)
}

function getToken(){
    return localStorage.getItem('loginToken')
}

function deleteToken(){
    localStorage.removeItem('loginToken')
}

export{
    setToken,
    getToken,
    deleteToken
}