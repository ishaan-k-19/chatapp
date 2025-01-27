import { server } from '@/constants/config'
import { createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react'

// Create an API slice to manage API interactions
const api = createApi({
    reducerPath: 'api', // Identifier for the API slice
    baseQuery: fetchBaseQuery({
        baseUrl: `${server}/api/v1/`, // Base URL for all requests
    }),

    tagTypes: ["Chat", "User"], // Tag types for cache invalidation

    endpoints: (builder) => ({
        // Endpoint to fetch user's chats
        myChats: builder.query({
            query: () => ({
                url: 'chat/my', // API path to fetch chats
                credentials: "include", // Include cookies (for authentication)
            }),
            providesTags: ['Chat'], // Cache tags to manage data invalidation
        }),

        // Endpoint to search for users by name
        searchUser: builder.query({
            query: (name) => ({
                url: `user/search?name=${name}`, // API path with query parameter
                credentials: "include",
            }),
            providesTags: ['User'],
        }),

        // Endpoint to fetch notifications
        getNotifications: builder.query({
            query: () => ({
                url: 'user/notifications', 
                credentials: "include",
            }),
            keepUnusedDataFor: 0, // Cache invalidation immediately after use
        }),

        // Endpoint to get chat details by chat ID
        chatDetails: builder.query({
            query: ({ chatId, populate = false }) => {
                let url = `chat/${chatId}`;
                if (populate) url += "?populate=true"; // Include related data if needed

                return {
                    url,
                    credentials: "include",
                };
            },
            providesTags: ["Chat"], // Invalidate the chat data after fetching
        }),

        // Endpoint to fetch group chat details
        groupDetails: builder.query({
            query: ({ chatId }) => ({
                url: `chat/group/${chatId}`,
                credentials: "include",
            }),
            providesTags: ["Chat"],
        }),

        // Mutation to send a friend request
        sendFriendRequest: builder.mutation({
            query: (data) => ({
                url: 'user/sendrequest', // API endpoint for sending a request
                method: 'PUT',
                credentials: "include",
                body: data, // Request body data
            }),
            invalidatesTags: ["User"], // Invalidate the user data after the mutation
        }),

        // Mutation for user verification
        verifyUser: builder.mutation({
            query: (data) => ({
                url: 'user/verify',
                method: 'POST',
                credentials: "include",
                body: data,
            }),
            invalidatesTags: ["User"],
        }),

        // Mutation for forgetting password
        forgotPassword: builder.mutation({
            query: (data) => ({
                url: 'user/forgetpassword',
                method: 'POST',
                credentials: "include",
                body: data,
            }),
            invalidatesTags: ["User"],
        }),

        // Mutation to reset password
        resetPassword: builder.mutation({
            query: (data) => ({
                url: 'user/resetpassword',
                method: 'PUT',
                credentials: "include",
                body: data,
            }),
            invalidatesTags: ["User"],
        }),

        // Mutation to update password
        updatePassword: builder.mutation({
            query: (data) => ({
                url: 'user/me/updatepassword',
                method: 'PUT',
                credentials: "include",
                body: data,
            }),
            invalidatesTags: ["User"],
        }),

        // Mutation to accept a friend request
        acceptFriendRequest: builder.mutation({
            query: (data) => ({
                url: 'user/acceptrequest',
                method: 'PUT',
                credentials: "include",
                body: data,
            }),
            invalidatesTags: ["Chat"], // Invalidate the chat data after accepting request
        }),

        // Endpoint to fetch messages in a chat
        getMessages: builder.query({
            query: ({ chatId, page }) => ({
                url: `chat/message/${chatId}?page=${page}`,
                credentials: "include",
            }),
            keepUnusedDataFor: 0,
        }),

        // Mutation to send attachments in a chat
        sendAttachments: builder.mutation({
            query: (data) => ({
                url: 'chat/message',
                method: 'POST',
                credentials: "include",
                body: data,
            }),
        }),

        // Endpoint to fetch user's groups
        myGroups: builder.query({
            query: () => ({
                url: 'chat/my/groups',
                credentials: "include",
            }),
            providesTags: ['Chat'],
        }),

        // Endpoint to fetch available friends for a given chat
        availableFriends: builder.query({
            query: (chatId) => {
                let url = `user/friends`;
                if (chatId) url += `?chatId=${chatId}`;

                return {
                    url,
                    credentials: "include",
                };
            },
            providesTags: ["Chat"],
        }),

        // Mutation to remove a group member
        removeGroupMember: builder.mutation({
            query: ({ chatId, userId }) => ({
                url: `chat/removemember`,
                method: 'PUT',
                credentials: "include",
                body: { chatId, userId },
            }),
            invalidatesTags: ["Chat"],
        }),

        // Mutation to add members to a group
        addGroupMembers: builder.mutation({
            query: ({ members, chatId }) => ({
                url: `chat/addmembers`,
                method: 'PUT',
                credentials: "include",
                body: { members, chatId },
            }),
            invalidatesTags: ["Chat"],
        }),

        // Mutation to delete a chat
        deleteChat: builder.mutation({
            query: (chatId) => ({
                url: `chat/${chatId}`,
                method: 'DELETE',
                credentials: "include",
            }),
            invalidatesTags: ["Chat"],
        }),

        // Mutation to leave a group chat
        leaveGroup: builder.mutation({
            query: (chatId) => ({
                url: `chat/leave/${chatId}`,
                method: 'DELETE',
                credentials: "include",
            }),
            invalidatesTags: ["Chat"],
        }),

    })
});

export default api;
export const { 
    useMyChatsQuery,
    useLazySearchUserQuery, 
    useSendFriendRequestMutation,
    useGetNotificationsQuery,
    useAcceptFriendRequestMutation,
    useChatDetailsQuery,
    useGetMessagesQuery,
    useSendAttachmentsMutation,
    useMyGroupsQuery,
    useAvailableFriendsQuery,
    useRemoveGroupMemberMutation,
    useAddGroupMembersMutation,
    useDeleteChatMutation,
    useLeaveGroupMutation,
    useGroupDetailsQuery,
    useVerifyUserMutation,
    useForgotPasswordMutation,
    useResetPasswordMutation,
    useUpdatePasswordMutation,
} = api;