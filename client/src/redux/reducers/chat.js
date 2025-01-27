import { NEW_MESSAGE_ALERT } from "@/constants/events";
import { getOrSaveFromStorage } from "@/lib/features";
import { createSlice } from "@reduxjs/toolkit";

// Initial state for chat notifications
const initialState = {
  notificationCount: 0, // Total notification count
  // Get or initialize new message alerts from storage (defaults to an empty array with a single item if not found)
  newMessagesAlert: getOrSaveFromStorage({
    key: NEW_MESSAGE_ALERT,
    get: true,
  }) || [
    {
      chatId: "", // Default chatId if nothing is in storage
      count: 0, // Initial alert count
    },
  ],
};

// Create chat slice to manage state for notifications and new message alerts
const chatSlice = createSlice({
  name: "chat", // Name of the slice
  initialState, // Initial state defined above
  reducers: {
      // Increment notification count
      incrementNotification: (state) => {
          state.notificationCount += 1; // Increase notification count
      },
      // Decrement notification count, ensuring it doesn't go below zero
      decrementNotification: (state) => {
          state.notificationCount -= 1;
          if (state.notificationCount < 0) {
              state.notificationCount = 0; // Prevent negative values
          }
      },
      // Reset notification count to zero
      resetNotificationCount: (state) => {
          state.notificationCount = 0; // Reset count
      },

      // Add or update the new message alert for a specific chat
      setNewMessagesAlert: (state, action) => {
          const chatId = action.payload.chatId; // Get chatId from payload

          // Check if there's already an alert for this chatId
          const index = state.newMessagesAlert.findIndex(
              (item) => item.chatId === chatId
          );

          if (index !== -1) {
              // If found, increment the count for this chat
              state.newMessagesAlert[index].count += 1;
          } else {
              // If not found, add a new alert entry for this chat
              state.newMessagesAlert.push({
                  chatId,
                  count: 1, // Initial count for the new chat alert
              });
          }
      },

      // Remove new message alert for a specific chat
      removeNewMessagesAlert: (state, action) => {
          // Filter out the alert for the chatId provided in the payload
          state.newMessagesAlert = state.newMessagesAlert.filter(
              (item) => item.chatId !== action.payload
          );
      },
  },
});
  
  export default chatSlice;
  export const {
    incrementNotification,
    resetNotificationCount,
    decrementNotification,
    setNewMessagesAlert,
    removeNewMessagesAlert,
  } = chatSlice.actions;