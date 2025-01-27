import React from 'react'
import { Outlet } from 'react-router-dom'
import { Navigate } from 'react-router-dom'

/**
 * ProtectRoute Component
 * This component protects routes by ensuring a user is logged in.
 * If the user is not logged in, it redirects them to the specified redirect path (default is "/login").
 */
const ProtectRoute = ({ children, user, redirect = "/login" }) => {
    // If no user is logged in, redirect to the specified path
    if (!user) return <Navigate to={redirect} />;
    
    // If children are provided, render them; otherwise, render the child route using Outlet
    return children ? children : <Outlet />;
};


export default ProtectRoute
