import { useFetchData } from "6pp";
import AdminLayout from "@/components/layout/AdminLayout";
import DynamicTable from "@/components/shared/DynamicTable"; // Adjust the path based on your project structure
import RenderAttachment from "@/components/shared/RenderAttachment";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { server } from "@/constants/config";
import { useErrors } from "@/hooks/hooks";
import { fileFormat, transformImage } from "@/lib/features";
import moment from "moment";
import { useEffect, useState } from "react";

const columns = [
  {
    accessorKey: "id",
    header: "ID",
  },
{
  accessorKey: "attachment",
  header: "Attachments",
  cell: ({ row }) => {
    const { attachments } = row.original;

    return (
      <div className="max-w-18 flex gap-1 flex-wrap max-h-14 overflow-auto">
        {attachments?.length > 0 ? (
          attachments.map((i, index) => {
            const url = i.url;
            const file = fileFormat(url);

            return (
              <div key={index} className="w-10">
                <a href={url} download target="_blank">
                  {RenderAttachment(file, url)}
                </a>
              </div>
            );
          })
        ) : (
          <h5>No Attachments</h5>
        )}
      </div>
    );
  },
  enableSorting: false,
},

  {
    accessorKey: "content",
    header: "Content",
    enableSorting: false,
  },
  {
    accessorKey: "sender",
    header: "Sent By",
    cell: ({ row }) => <div className="text-left flex items-center gap-1">
      <Avatar className="w-8 h-8">
      <AvatarImage src={row.original.sender.avatar} alt={row.original.sender.name} />
    </Avatar>
    <span>{row.original.sender.name}</span>
    </div>,
  },
  {
    accessorKey: "chat",
    header: "Chat",
    enableSorting: false,
  },
  {
    accessorKey: "groupChat",
    header: "Group Chat",
  },
  {
    accessorKey: "createdAt",
    header: "Time",
  },
];

const MessageManagement = () => {

  const {loading, data, error } = useFetchData(`${server}/api/v1/admin/messages`, "dashboard-messages");



  
  useErrors([{
    isError: error,
    error: error
  }])

  const [rows, setRows] = useState([]);



  

  useEffect(() => {

    if(data){
      setRows(
        data.messages.map((i) => ({
          ...i,
          id: i._id,
          avatar: transformImage(i.avatar, 50),
          createdAt: moment(i.createdAt).format("MMMM Do YYYY, h:mm:ss a")
        }))
      )
    }
  }, [data]);

  return (
    <AdminLayout>
      <Card className="my-8 mx-5 h-[90svh]">
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

export default MessageManagement;
