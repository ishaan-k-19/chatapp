import { GroupIcon, LogOutIcon, LucideUserCog2, MenuIcon, MessageCircle, XIcon } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader } from '../ui/drawer';
import { useLocation, Link as LinkComponent, Navigate } from 'react-router-dom';
import { LayoutDashboardIcon } from 'lucide-react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { adminLogout } from '@/redux/thunks/admin';
import { ModeToggle } from '../ui/mode-toggler';
import { useTheme } from '../ui/theme-provider';

// Custom styled Link component with styled-components
const Link = styled(LinkComponent)`
    text-decoration: none;
    border-radius: 2rem;
    padding: 1rem 2rem;
`;

// Admin tabs configuration (menu items in sidebar)
const adminTabs = [
    {
        name: 'Dashboard',
        path: '/admin/dashboard',
        icon: <LayoutDashboardIcon />  // Icon for Dashboard tab
    },
    {
        name: 'Users',
        path: '/admin/users',
        icon: <LucideUserCog2/>  // Icon for Users tab
    },
    {
        name: 'Chats',
        path: '/admin/chats',
        icon: <GroupIcon />  // Icon for Chats tab
    },
    {
        name: 'Messages',
        path: '/admin/messages',
        icon: <MessageCircle />  // Icon for Messages tab
    },
];

// Sidebar component which renders admin menu options
const Sidebar = () => {

    const { theme, systemTheme } = useTheme();  // Custom theme hook to determine the current theme

    // Determines if the current theme is dark or light
    const mode = theme === "dark" || (theme === "system" && systemTheme === "dark") ? "dark" : "light";

    const location = useLocation();  // Access current location/path
    const dispatch = useDispatch();  // Redux dispatch hook

    // Logout handler dispatches adminLogout action
    const logoutHandler = () => {
        dispatch(adminLogout());
    }

    return (
        
        <div className="flex flex-col p-12 gap-12">
            <h4 className="text-2xl">AppName</h4>
            <div className='flex flex-col gap-4'>
                {adminTabs.map((tab) => {
                    const isActive = location.pathname === tab.path;
                    return (
                        <Link key={tab.path} to={tab.path} {...isActive & mode==="light" && {style:{ backgroundColor:"black", color:"white"}}} {...isActive & mode==="dark" && {style:{ backgroundColor:"white", color:"black"}}}>
                    <div className="flex gap-4">
                       {tab.icon}
                       <h5>{tab.name}</h5>
                    </div>
                       </Link>
                    );
                })}
                <Link onClick={logoutHandler}>
                    <div className="flex gap-4 dark:text-white">
                        <LogOutIcon/>
                       <h5>Logout</h5>
                    </div>
                </Link>
                <div className="flex gap-4 items-center">
                        <ModeToggle variant={"icon"} className=" shadow-none border-none px-1 ml-6"/>
                       <h5>Toggle Mode</h5>
                </div>
            </div>   
        </div>
    );
};

// AdminLayout component that manages layout, including sidebar and children content
const AdminLayout = ({ children }) => {
    const { isAdmin } = useSelector(state => state.auth);  // Check if the user is an admin
    const [isMobile, setIsMobile] = useState(false);  // State to manage mobile drawer visibility

    const handleMobile = () => setIsMobile(!isMobile);  // Toggle mobile drawer

    // If the user is not an admin, redirect to the admin login page
    if (!isAdmin) return <Navigate to="/admin" />;


    return (
        <div className="grid min-h-[100vh] grid-cols-12">
            <div className="block fixed right-4 top-4 md:hidden">
                <Button className="px-2 rounded-full" onClick={handleMobile}>
                    {isMobile ? <XIcon /> : <MenuIcon />}
                </Button>
            </div>
            <div className='col-span-3'>
                <Sidebar />
            </div>
            <div className='col-span-9'>{children}</div>
            <Drawer
                open={isMobile}
                onClose={() => setIsMobile(false)}
                className="fixed inset-0 z-50 flex justify-end"
            >
                <DrawerContent className="w-full bg-white shadow-lg block md:hidden">
                    <DrawerHeader>
                        <DrawerDescription>
                            <Sidebar />
                        </DrawerDescription>
                    </DrawerHeader>
                    <DrawerFooter>
                        <DrawerClose asChild>
                            <Button
                                className="absolute top-3 right-4 bg-slate-200 rounded-full px-2"
                                variant="outline"
                                onClick={() => setIsMobile(false)}
                            >
                                <XIcon />
                            </Button>
                        </DrawerClose>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </div>
    );
};

export default AdminLayout;
