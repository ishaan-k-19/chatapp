import { createSlice } from "@reduxjs/toolkit";

// Initial state for the various UI flags and settings
const initialState = {
    isNewGroup: false, // Determines if the 'New Group' modal is visible
    isAddMember: false, // Determines if the 'Add Member' modal is visible
    isNotification: false, // Controls visibility of the notification panel
    isMobile: false, // Checks if the current device is mobile for responsive design
    isSearch: false, // Controls the search input visibility
    isFileMenu: false, // Controls file menu visibility
    isDeleteMenu: false, // Controls delete menu visibility
    uploadingLoader: false, // Indicates if the file is being uploaded
    selectedDeleteChat: {
        chatId: "", // Stores the ID of the selected chat to be deleted
        groupChat: false, // Flag for identifying if the selected chat is a group
    },
    isProfile: false, // Indicates if the profile modal is visible
};

// Creating the slice to handle UI-related state
const miscSlice = createSlice({
    name: "misc", // Name of the slice
    initialState, // Initial state defined above
    reducers: {
        // Reducers to toggle the visibility or state of various UI elements
        setIsNewGroup: (state, action) => {
            state.isNewGroup = action.payload; // Set the new group modal visibility
        },
        setIsAddMember: (state, action) => {
            state.isAddMember = action.payload; // Set the add member modal visibility
        },
        setIsNotification: (state, action) => {
            state.isNotification = action.payload; // Set the notification panel visibility
        },
        setIsMobile: (state, action) => {
            state.isMobile = action.payload; // Set the mobile status for responsive design
        },
        setIsSearch: (state, action) => {
            state.isSearch = action.payload; // Set the search input visibility
        },
        setIsFileMenu: (state, action) => {
            state.isFileMenu = action.payload; // Set the file menu visibility
        },
        setIsDeleteMenu: (state, action) => {
            state.isDeleteMenu = action.payload; // Set the delete menu visibility
        },
        setUploadingLoader: (state, action) => {
            state.uploadingLoader = action.payload; // Set the file upload loader visibility
        },
        setSelectedDeleteChat: (state, action) => {
            state.selectedDeleteChat = action.payload; // Set the selected chat to delete
        },
        setIsProfile: (state, action) => {
            state.isProfile = action.payload; // Set the profile modal visibility
        },
    },
});

export default miscSlice;
export const { setIsAddMember, setIsDeleteMenu, setIsFileMenu, setIsMobile, setIsNewGroup, setIsNotification, setIsSearch, setSelectedDeleteChat, setUploadingLoader, setIsProfile } = miscSlice.actions;