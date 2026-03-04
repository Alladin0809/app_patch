"use strict";

import axios from "axios";

// 创建axios实例
var instance = axios.create({
    timeout: 60000,
    withCredentials: true,
    validateStatus: status => (status >= 200 && status < 300) || status === 402
});

instance.defaults.withCredentials = true
// 设置post请求头
// instance.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";

/**
 * 请求拦截器
 * 每次请求前，如果存在token则在请求头中携带token
 */
instance.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        console.warn(JSON.stringify(error))
        //Promise.reject(error)}
        return Promise.reject(error)
    }
);

// 响应拦截器
instance.interceptors.response.use(
    response => {
        if (response.status === 402) {
            console.warn("need payment:", response.data);
        }

        return response;
    },
    error => {
        console.warn(JSON.stringify(error))
        //Promise.reject(error)
        return Promise.reject(error)
    }
);


// 响应拦截器
instance.interceptors.response.use(
    (res) => {
        // 2xx go
        return res;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const getCookie = (cname) => {
    const headers = useRequestHeaders(['cookie'])
    let aCookie
    if (import.meta.server) {
        aCookie = headers.cookie.split("; ")
    } else {
        aCookie = document.cookie.split("; ")
    }
    for (var i = 0; i < aCookie.length; i++) {
        var aCrumb = aCookie[i].split("=");
        if (cname === aCrumb[0]) return aCrumb[1];
    }
    return "";
};

export const setCookie = (name, value, days) => {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + value + expires + "; path=/";
}

/** 
目的获取图片的信息，比如图片类型，图片大小
console.log('图片类型:', response.headers['content-type']);
console.log('图片大小:', response.headers['content-length']);
*/
export const head = async (imageUrl) => {
    try {
        const response = await axios.head(imageUrl);
        if (response.status === 200) {
            return true;
        }
    } catch (error) {
        return false;
    }
}

export default instance;
