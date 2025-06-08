import React from 'react'; //Imports react files for routing
import { useSelector } from 'react-redux';//Imports file for getting current user
import { Outlet, Navigate } from 'react-router-dom';

export default function PrivateRoute() {
    const {currentUser} = useSelector(state => state.user)
    return currentUser ?  <Outlet/> : <Navigate to='/SignIn' />    //If a user exists navigates to the profile page, if not navigates to the sign in page
   
}