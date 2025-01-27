import React, { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectRoute from "./components/auth/ProtectRoute";
import {LayoutLoader} from "./components/layout/Loaders";
import axios from "axios";
import { server } from "./constants/config";
import { useDispatch, useSelector } from "react-redux";
import { userExists, userNotExists } from "./redux/reducers/auth";
import { Toaster } from "react-hot-toast";
import { SocketProvider } from "./socket";
import Profile from "./components/specific/Profile";


// Lazily loading pages for better performance
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Chat = lazy(() => import("./pages/Chat"));
const Groups = lazy(() => import("./pages/Groups"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const UserManagement = lazy(() => import("./pages/admin/UserManagement"));
const ChatMangement = lazy(() => import("./pages/admin/ChatMangement"));
const MessageManagement = lazy(() => import("./pages/admin/MessageManagement"));

function App() {
  // Redux state for the user and loader state
  const { user, loader } = useSelector(state => state.auth);

  const dispatch = useDispatch(); // Dispatch function for sending actions to the store

  // useEffect to check user authentication when the component mounts
  useEffect(() => {
    axios
      .get(`${server}/api/v1/user/me`, { withCredentials: true }) // API call to check the current user
      .then(({ data }) => dispatch(userExists(data.user))) // Dispatch the user exists action if the API returns a user
      .catch((err) => dispatch(userNotExists())); // If there is an error (no user), dispatch userNotExists
  }, [dispatch]); // Dependency array to re-run the effect only if dispatch changes

  // If loader is true, show the layout loader, otherwise render the app's routes
  return loader ? <LayoutLoader /> : (
    <>
      <BrowserRouter>
        <Suspense
          fallback={
            <div>
              <LayoutLoader /> {/* Loader shown while routes are loading */}
            </div>
          }
        >
          <Routes>
            {/* Protect the routes requiring authentication */}
            <Route element={<SocketProvider>
              <ProtectRoute user={user} /> {/* Protect route component ensures that routes are accessible only if the user is authenticated */}
            </SocketProvider>}>
              <Route path="/" element={<Home />} /> {/* Home page */}
              <Route path="/chat/:chatId" element={<Chat />} /> {/* Chat page with dynamic chatId */}
              <Route path="/groups" element={<Groups />} title="ConvocCube - Groups" /> {/* Groups page */}
              <Route path="/profile" element={<Profile user={user} />} title="ConvoCube - Profile" /> {/* Profile page */}
            </Route>

            {/* Login route */}
            <Route
              path="/login"
              title="ConvoCube-Login"
              element={
                <ProtectRoute user={!user} redirect="/"><Login /></ProtectRoute> // If user is already logged in, redirect them from login page
              }
            />

            {/* Admin routes */}
            <Route path="/admin" element={<AdminLogin />} /> {/* Admin login */}
            <Route path="/admin/dashboard" element={<Dashboard />} /> {/* Admin dashboard */}
            <Route path="/admin/users" element={<UserManagement />} /> {/* Admin user management */}
            <Route path="/admin/chats" element={<ChatMangement />} /> {/* Admin chat management */}
            <Route path="/admin/messages" element={<MessageManagement />} /> {/* Admin message management */}
            
            {/* Fallback route for unmatched paths */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>

        {/* Global toaster notifications */}
        <Toaster position="top-right" />
      </BrowserRouter>
    </>
  );
}

export default App;
