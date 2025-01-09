import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import React from "react";

interface ConnectionRequest {
  _id: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    photo: string;
    username: string;
  };
  relative: {
    _id: string;
    firstName: string;
    lastName: string;
    photo: string;
    username: string;
  };
  relationType: string;
  status: string;
  approvalNeededFrom: string[];
  approvalGotFrom: string[];
  rejectedBy: {
    _id: string;
    firstName: string;
    lastName: string;
    photo: string;
    username: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface ConnectionRequestsProps {
  requests: ConnectionRequest[];
  currentUserId: string;
}

const getStatusClass = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    case "accepted":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const MyRequests = ({ requests, currentUserId }: ConnectionRequestsProps) => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Requests</h1>
      {requests.length === 0 ? (
        <div className="text-center text-gray-500">
          <h1>No requests sent!</h1>
        </div>
      ) : (
        requests.map((request) => (
          <Card key={request._id} className="shadow-lg border border-gray-200 rounded-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="border-2 border-gray-200">
                    <AvatarImage src={request.relative.photo} />
                    <AvatarFallback>
                      {request.relative.firstName[0]}
                      {request.relative.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{`${request.relative.firstName} ${request.relative.lastName}`}</CardTitle>
                    <CardDescription>
                      <span className="text-gray-500">@{request.relative.username}</span>
                    </CardDescription>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <CardDescription>
                    <span className="text-gray-500 capitalize">{request.relationType}</span>
                  </CardDescription>
                  <div className={`px-3 py-1 mt-2 text-sm rounded ${getStatusClass(request.status)}`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </div>
                </div>
              </div>
              {request.status === "rejected" && request.rejectedBy && (
                <div className="flex items-center mt-4 space-x-4">
                  <Avatar className="border-2 border-gray-200">
                    <AvatarImage src={request.rejectedBy.photo} />
                    <AvatarFallback>
                      {request.rejectedBy.firstName[0]}
                      {request.rejectedBy.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardDescription>
                      <span className="text-red-800">
                        Rejected by: {`${request.rejectedBy.firstName} ${request.rejectedBy.lastName}`} (@{request.rejectedBy.username})
                      </span>
                    </CardDescription>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default MyRequests;
