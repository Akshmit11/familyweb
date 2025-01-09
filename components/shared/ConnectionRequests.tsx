import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
    gender: string;
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
  onAccept: (requestId: string) => void;
  onReject: (requestId: string) => void;
  currentUserId: string;
}

export function ConnectionRequests({
  requests,
  onAccept,
  onReject,
  currentUserId
}: ConnectionRequestsProps) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Connection Requests</h1>
      {requests.length === 0 ? (
        <div className="text-center text-gray-500">
          <h1>No requests right now!</h1>
        </div>
      ) : (
        requests.map((request) => {
          // Only display the request for the receiver (currentUserId)
          if (!request.approvalNeededFrom.includes(currentUserId)) {
            return null;
          }

          return (
            <Card key={request._id} className="shadow-lg border border-gray-200 rounded-lg">
              <CardContent className="p-4">
                <RequestCard
                  request={request}
                  onAccept={onAccept}
                  onReject={onReject}
                  currentUserId={currentUserId}
                />
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}

interface RequestCardProps {
  request: ConnectionRequest;
  onAccept: (requestId: string) => void;
  onReject: (requestId: string) => void;
  currentUserId: string;
}

function RequestCard({
  request,
  onAccept,
  onReject,
  currentUserId
}: RequestCardProps) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl shadow-sm">
      <div className="flex items-center gap-4">
        <Avatar className="shadow-sm">
          <AvatarImage src={request.user.photo} />
          <AvatarFallback className="bg-primary/10">
            {request.user.firstName[0]}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium text-gray-900">
            {request.user.firstName} {request.user.lastName}
          </p>
          <p className="text-sm text-gray-500">
            wants you to connect as {request.relative.gender === "male" ? "his" : "her"} <span className="font-bold">{request.relationType}</span>
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          onClick={() => onAccept(request._id)}
          variant="default"
          size="sm"
          className="transition-all duration-200 hover:shadow-md"
        >
          Accept
        </Button>
        <Button
          onClick={() => onReject(request._id)}
          variant="destructive"
          size="sm"
          className="transition-all duration-200 hover:shadow-md"
        >
          Reject
        </Button>
      </div>
    </div>
  );
}
