import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { CameraIcon, UserCircle } from 'lucide-react';
import { useFileHandler, useInputValidation } from '6pp';
import { Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { adminLogin, getAdmin } from '@/redux/thunks/admin';

const AdminLogin = () => {

  // Get current admin login status from Redux store
  const { isAdmin } = useSelector(state => state.auth);

  // Set up dispatch function to dispatch actions
  const dispatch = useDispatch();

  // Use custom hook for validating secret key input
  const secretKey = useInputValidation("");

  // Handle form submission
  const submitHandler = (e) => {
    e.preventDefault();
    // Dispatch admin login action with secret key value
    dispatch(adminLogin(secretKey.value));
  };

  // Fetch admin info when the component mounts
  useEffect(() => {
    dispatch(getAdmin());
  }, [dispatch]);

  // If admin is already logged in, redirect to the dashboard
  if (isAdmin) return <Navigate to="/admin/dashboard"></Navigate>;

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-indigo-500 to-blue-500">
      {/* Login form container */}
      <form className="flex flex-col justify-center items-center w-2/6 shadow-2xl p-16 border border-gray-300 rounded-xl bg-white dark:bg-neutral-900 dark:border-none" onSubmit={submitHandler}>
        <h5 className="text-3xl font-bold">Admin Login</h5>
        {/* Secret Key input field */}
        <input
          className="my-6 w-4/5 border border-neutral-400 dark:bg-neutral-700 dark:border-none p-2 rounded-md"
          type="password" // Password field for secret key
          placeholder="Secret Key" // Placeholder for the input
          name='secretkey' // Name attribute for the input
          required // Make this field required
          value={secretKey.value} // Bind the value of the input to the hook state
          onChange={secretKey.changeHandler} // Handle input changes using the custom hook
        />
        {/* Submit button */}
        <Button className="w-1/2 rounded-full my-2" type="submit">Login</Button>
      </form>
    </div>
  );
}

export default AdminLogin
