import { useFetchData } from "6pp";
import AdminLayout from "@/components/layout/AdminLayout";
import DynamicTable from "@/components/shared/DynamicTable"; // Adjust the path based on your project structure
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { server } from "@/constants/config";
import { dashboardData } from "@/constants/sampleData";
import { useErrors } from "@/hooks/hooks";
import { transformImage } from "@/lib/features";
import { useEffect, useState } from "react";

// Define table columns and their properties for the DynamicTable
const columns = [
  {
    accessorKey: "id",
    header: "ID", // Column header for ID
  },
  {
    accessorKey: "avatar",
    header: "Avatar", // Column header for Avatar
    cell: ({ row }) => (
      <img
        src={row.original.avatar || row.original.members[0].avatar} // Display the avatar of the chat or the first member
        alt={`${row.original.name}'s avatar`} // Alt text for the avatar image
        className="w-10 h-10 rounded-full" // Styling for the avatar image
      />
    ),
    enableSorting: false, // Disable sorting for this column
  },
  {
    accessorKey: "name",
    header: "Name", // Column header for Name
  },
  {
    accessorKey: "groupChat",
    header: "Group", // Column header for Group
  },
  {
    accessorKey: "totalMembers",
    header: "Total Members", // Column header for Total Members
    enableSorting: false, // Disable sorting for this column
  },
  {
    accessorKey: "members",
    header: "Members", // Column header for Members
    cell: ({ row }) => (
      <div className="text-left flex items-center gap-1">
        {row.original.totalMembers > 2 ? ( // If there are more than 2 members, display the avatar and name of the first member
          <>
            <Avatar className="w-8 h-8">
              <AvatarImage 
                src={row.original.members[0].avatar} // Display the first member's avatar
                alt={row.original.members[0].name} // Alt text for the first member's avatar
              />
            </Avatar>
            <span>
              {row.original.members[0].name} +{row.original.totalMembers} // Display member's name and total number of members
            </span>
          </>
        ) : (
          <h5>No Members</h5> // If there are no members, display "No Members"
        )}
      </div>
    ),
    enableSorting: true, // Enable sorting for this column
  },
  {
    accessorKey: "totalMessages",
    header: "Total Messages", // Column header for Total Messages
    enableSorting: false, // Disable sorting for this column
  },
  {
    accessorKey: "creator",
    header: "Creator", // Column header for Creator
    cell: ({ row }) => (
      <div className="text-left flex items-center gap-1">
        <Avatar className="w-8 h-8">
          <AvatarImage
            src={row.original.creator.avatar} // Display the creator's avatar
            alt={row.original.creator.name} // Alt text for the creator's avatar
          />
        </Avatar>
        <span>{row.original.creator.name}</span> 
      </div>
    ),
    enableSorting: false, // Disable sorting for this column
  },
];

// Chat Management component for rendering the chat data
const ChatMangement = () => {
  // Fetch data using the custom hook and store loading, data, and error states
  const { loading, data, error } = useFetchData(`${server}/api/v1/admin/chats`, "dashboard-chats");

  // Use the custom useErrors hook to handle and display any errors
  useErrors([{
    isError: error,
    error: error
  }])

  // State to store the rows of chat data for the table
  const [rows, setRows] = useState([]);

  // Use effect to update rows once data is available
  useEffect(() => {
    if (data) {
      setRows(
        data.chats.map((i) => ({
          ...i,
          id: i._id, // Set ID
          avatar: transformImage(i.avatar, 50), // Transform avatar image
          creator: {
            name: i.creator.name, // Set creator's name
            avatar: transformImage(i.creator.avatar, 50) // Transform creator's avatar image
          }
        }))
      )
    }
  }, [data]); // Depend on data so effect runs when data changes

  return (
    <AdminLayout> 
      <Card className="my-10 mx-5 h-[90svh]"> 
        <CardHeader> 
          <CardTitle className="text-5xl text-center">All Chats</CardTitle> 
        </CardHeader>
        <CardContent className="p-10"> 
          <div>
            <DynamicTable columns={columns} data={rows} /> 
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default ChatMangement;
