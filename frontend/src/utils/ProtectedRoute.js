import React, { useState, useEffect } from "react";
import {
  Navigate,
} from "react-router-dom";
import axios from 'axios'
import {URL_USER_SVC} from "../configs";
import {STATUS_CODE_OK} from "../constants";

function ProtectedRoute({children}) {
    const [data, setData] = useState(null)
    const [status, setStatus] = useState(null)
    // const auth = async () => await axios.get(URL_USER_SVC + '/auth', { withCredentials: true })
    //         .then((res) => {
    //             setData(res.data)
    //         })
    const auth = useAuth().then(res => res.data)
    // useEffect(() => {
    //     const auth = axios.get(URL_USER_SVC + '/auth', { withCredentials: true })
    //         .then((res) => {
    //             setData(res.data)
    //         })
    //     console.log(auth)
    // }, [])
    console.log(auth)
    // return data && status ===  STATUS_CODE_OK? 
    //     children : <Navigate to="/login"/>
    return children;
}

async function useAuth() {
    return await axios.get(URL_USER_SVC + '/auth', { withCredentials: true })
            .then((res) => {return res.data})
}

export default ProtectedRoute;