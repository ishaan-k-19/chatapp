import { useFetchData } from "6pp";
import AdminLayout from "@/components/layout/AdminLayout";
import DynamicTable from "@/components/shared/DynamicTable"; // Adjust the path based on your project structure
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { server } from "@/constants/config";
import { useErrors } from "@/hooks/hooks";
import { transformImage } from "@/lib/features";
import { AtSignIcon } from "lucide-react";
import { useEffect, useState } from "react";

// Table columns configuration
const columns = [
  {
    accessorKey: "id",  // The key for user ID
    header: "ID",  // Table column header
  },
  {
    accessorKey: "avatar",  // The key for user avatar
    header: "Avatar",  // Table column header
    cell: ({ row }) => (
      <img
        src={row.original.avatar}  // Image source is the user's avatar
        alt={`${row.original.name}'s avatar`}  // Alt text for accessibility
        className="w-10 h-10 rounded-full"  // Style for circular avatar
      />
    ),
    enableSorting: false,  // Disables sorting for the avatar column
  },
  {
    accessorKey: "name",  // The key for user's name
    header: "Name",  // Table column header
  },
  {
    accessorKey: "username",  // The key for user's username
    header: "Username",  // Table column header
    cell: ({ row }) => (
      <div className="text-left flex items-center gap-1">
        <AtSignIcon size="15" /> {/* AtSign icon */}
        {row.original.username}  {/* Username value */}
      </div>
    ),
    enableSorting: false,  // Disables sorting for the username column
  },
  {
    accessorKey: "friends",  // The key for user's friends count
    header: "Friends",  // Table column header
    enableSorting: true,  // Enables sorting for the friends column
  },
  {
    accessorKey: "groups",  // The key for user's groups count
    header: "Groups",  // Table column header
  },
];

const UserManagement = () => {
  // Fetching data for the user list from the server
  const { loading, data, error } = useFetchData(`${server}/api/v1/admin/users`, "dashboard-users");

  // Handling errors if any during the data fetch
  useErrors([{
    isError: error,
    error: error
  }]);

  // State to store user data in rows for the table
  const [rows, setRows] = useState([]);

  // Effect hook to transform and set the data once it is fetched
  useEffect(() => {
    if (data) {
      // Mapping and transforming the fetched data before setting it
      setRows(
        data.users.map((i) => ({
          ...i,
          id: i._id,  // Assign unique ID for the row
          avatar: transformImage(i.avatar, 50)  // Transform the avatar to a specific size
        }))
      );
    }
  }, [data]);

  return (
    <AdminLayout>
      <Card className="my-10 mx-5 h-[90svh]">
        <CardHeader>
          <CardTitle className="text-5xl text-center">All Messages</CardTitle>
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

export default UserManagement;
