import React from "react";
import {
  Navigate,
  Outlet
} from "react-router-dom";

function ProtectedRoute() {
    const user = useAuth()
    return user? <Outlet /> : <Navigate to="/login"/>;
}

const useAuth=()=>{
  const user = sessionStorage.getItem('token')
  if (user) {
    return true
  } else {
    return false
  }
}

export default ProtectedRoute;
