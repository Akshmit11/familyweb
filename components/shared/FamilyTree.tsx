"use client";
import {
  acceptConnectionRequest,
  addPendingRelation,
  fetchConnectionRequests,
  fetchSentConnectionRequests,
  rejectConnectionRequest,
} from "@/lib/actions/relationship.actions";
import { getDirectRelations } from "@/lib/actions/user.actions";
import { IUser } from "@/lib/database/models/user.model";
import { useEffect, useState } from "react";
import { ConnectionForm } from "./ConnectionForm";
import { ProfileNode } from "./ProfileNode";
import { ConnectionRequests } from "./ConnectionRequests";
import MyRequests from "./MyRequests";

interface RelativePosition {
  relationType: string;
  angle: number;
  distance: number;
}

interface IUserBasic {
  _id: string;
  firstName: string;
  lastName: string;
  photo: string;
  username: string;
  gender: string;
}

const RELATION_POSITIONS: { [key: string]: RelativePosition } = {
  father: { relationType: "father", angle: -90, distance: 35 },
  mother: { relationType: "mother", angle: -45, distance: 35 },
  spouse: { relationType: "spouse", angle: 0, distance: 35 },
  brother: { relationType: "brother", angle: 45, distance: 35 },
  sister: { relationType: "sister", angle: 90, distance: 35 },
  son: { relationType: "son", angle: 135, distance: 35 },
  daughter: { relationType: "daughter", angle: 180, distance: 35 },
};

export function FamilyTree({ userId }: { userId: string }) {
  const [currentMember, setCurrentMember] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [path, setPath] = useState<Array<{ id: string; name: string }>>([]);
  const [relatives, setRelatives] = useState<any[]>([]);
  const [connectionRequests, setConnectionRequests] = useState<any>([]);
  const [sentConnectionRequests, setSentConnectionRequests] = useState<any>([]);
  const [approvalRequests, setApprovalRequests] = useState<any>([]);

  const calculateRelativePositions = (member: IUser) => {
    if (!member) return [];

    const positions: Array<{
      member: IUserBasic;
      relationType: string;
      position: { x: number; y: number };
    }> = [];

    const addPosition = (
      relative: IUserBasic,
      relationType: string,
      angle: number,
      distance: number,
      index: number,
      total: number
    ) => {
      const angleOffset = total > 1 ? (index - (total - 1) / 2) * 30 : 0;
      const finalAngle = (angle + angleOffset) * (Math.PI / 180);

      positions.push({
        member: relative,
        relationType,
        position: {
          x: 50 + distance * Math.cos(finalAngle),
          y: 50 + distance * Math.sin(finalAngle),
        },
      });
    };

    const isUserBasic = (obj: any): obj is IUserBasic =>
      obj &&
      typeof obj === "object" &&
      "_id" in obj &&
      "firstName" in obj &&
      "lastName" in obj;

    Object.entries(RELATION_POSITIONS).forEach(
      ([relationType, positionInfo]) => {
        const relations = member[relationType as keyof IUser];
        if (!relations) return;

        const isArray = Array.isArray(relations);

        (isArray ? relations : [relations]).forEach((relative, index, all) => {
          if (isUserBasic(relative)) {
            addPosition(
              relative,
              relationType,
              positionInfo.angle,
              positionInfo.distance,
              index,
              all.length
            );
          }
        });
      }
    );

    return positions;
  };

  const navigateTo = async (id: string) => {
    try {
      setLoading(true);
      const memberData = await getDirectRelations(id);

      if (!memberData) {
        console.error("No member data found");
        return;
      }

      setCurrentMember(memberData); // Now memberData includes full IUser structure

      setPath((prev) => [
        ...prev,
        {
          id: memberData._id,
          name: `${memberData.firstName} ${memberData.lastName}`,
        },
      ]);

      const positions = calculateRelativePositions(memberData);
      setRelatives(positions);
    } catch (error) {
      console.error("Error navigating to family member:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      navigateTo(userId);
      getConnectionRequestsList(userId);
      getSentConnectionRequests(userId);
      getApprovalRequests(userId);
    }
  }, [userId]);

  const addRelationship = async (
    relativeUsername: string,
    relationType: string
  ) => {
    try {
      setLoading(true);

      const pendingRelation = await addPendingRelation(
        currentMember?._id!,
        relativeUsername,
        relationType
      );

      if (pendingRelation) {
        // Optionally update the state directly with the new pending relation
        setSentConnectionRequests((prevRequests: any) => [
          ...prevRequests,
          pendingRelation,
        ]);

        // Re-fetch the sent connection requests to ensure consistency
        const updatedSentRequests = await fetchSentConnectionRequests(userId);
        setSentConnectionRequests(updatedSentRequests || []);
      }
    } catch (error) {
      console.error("Error adding pending relationship:", error);
    } finally {
      setLoading(false);
    }
  };

  const acceptRequest = async (requestId: string) => {
    try {
      // Call a function to accept the connection request
      await acceptConnectionRequest(requestId, userId);

      // Update the connection requests state by removing the accepted request
      setConnectionRequests((prevRequests: any) =>
        prevRequests.filter((request: any) => request._id !== requestId)
      );

      // Optionally, you can update other states or data here,
      // such as adding the connected user to a list of connections or families
    } catch (error) {
      console.error("Error accepting connection request:", error);
    }
  };

  const handleNodeClick = async (memberId: string) => {
    const clickedNode = document.querySelector(
      `[data-member-id="${memberId}"]`
    );
    const centerNode = document.querySelector(
      `[data-member-id="${currentMember?._id}"]`
    );

    if (clickedNode && centerNode) {
      if (memberId !== currentMember?._id) {
        clickedNode.classList.add("transition-to-center");
        const clickedMemberData = relatives.find(
          (rel) => rel.member._id === memberId
        );
        if (clickedMemberData) {
          centerNode.classList.add("transition-to-outside");
        }
      }
    }

    setTimeout(() => {
      if (memberId === currentMember?._id) {
        // Instead of resetting to just the current user, find their position in the path
        // const currentIndex = path.findIndex(item => item.id === memberId);
        // if (currentIndex !== -1) {
        // Keep the path up to and including the clicked member
        // setPath(path.slice(0, currentIndex + 1));
        setCurrentMember(currentMember);
        // const positions = calculateRelativePositions(currentMember);
        // setRelatives(positions);
        // }
      } else {
        navigateTo(memberId);
      }
    }, 300);
  };

  const getConnectionRequestsList = async (userId: string) => {
    try {
      const fetchConnectionRequestsList = await fetchConnectionRequests(userId);
      setConnectionRequests(fetchConnectionRequestsList);
    } catch (error) {
      console.error("Error fetching connection requests:", error);
    }
  };

  const getSentConnectionRequests = async (userId: string) => {
    try {
      const fetchSentConnectionRequestsList = await fetchSentConnectionRequests(
        userId
      );
      setSentConnectionRequests(fetchSentConnectionRequestsList);
    } catch (error) {
      console.error("Error fetching sent connection requests:", error);
    }
  };

  const getApprovalRequests = async (userId: string) => {
    try {
      // const fetchApprovalRequestsList = await fetchApprovalRequests(userId);
      // setApprovalRequests(fetchApprovalRequestsList);
    } catch (error) {
      console.error("Error fetching approval requests:", error);
    }
  };

  const rejectRequest = async (requestId: string) => {
    try {
      await rejectConnectionRequest(requestId, userId);
      setConnectionRequests((prevRequests: any) =>
        prevRequests.filter((request: any) => request._id !== requestId)
      );
    } catch (error) {
      console.error("Error rejecting connecting relationship:", error);
    }
  };

  // console.log(connectionRequests)

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading family tree...
      </div>
    );
  }

  if (!currentMember) {
    return (
      <div>Current member not found. Unable to load family tree data.</div>
    );
  }

  return (
    <div className="flex w-full gap-6 p-6">
      <div className="w-[70%] space-y-4">
        <div className="relative w-full h-[500px] bg-gray-50 rounded-lg shadow-inner overflow-hidden">
          <ProfileNode
            member={currentMember}
            isMainUser={true}
            onNodeClick={handleNodeClick}
            position={{ x: 50, y: 50 }}
            data-member-id={currentMember?._id}
          />
          {relatives.map((relative) => (
            <ProfileNode
              key={relative.member?._id}
              member={relative.member as IUser}
              isMainUser={false}
              relationType={relative.relationType}
              onNodeClick={handleNodeClick}
              position={relative.position}
              data-member-id={relative.member?._id}
            />
          ))}
          {/* TODO */}
          {
            // pendingRelations.map((relation, index) => {
            //   const angle = (index / pendingRelations.length) * 2 * Math.PI;
            //   const x = 50 + 25 * Math.cos(angle);
            //   const y = 50 + 25 * Math.sin(angle);
            //   return (
            //     <ProfileNode
            //       key={relation?._id}
            //       member={relation.relative}
            //       isMainUser={false}
            //       relationType={relation.relationType}
            //       onNodeClick={() => {}}
            //       position={{ x, y }}
            //       isPending={true}
            //     />
            //   );
            // })
          }
        </div>
        <div className="space-y-4">
          {/*  two more cards - requests that you got and requests that need your approval */}
          <ConnectionRequests
            requests={connectionRequests}
            onAccept={acceptRequest}
            onReject={rejectRequest}
            currentUserId={userId}
          />
          {/* <PendingRequests
            pendingRequestsList={fetchPendingRequests}
            onAccept={handleAccept}
            onReject={rejectPendingRelation}
            isProcessing={isAccepting}
            currentUserId={userId}
          /> */}
        </div>
      </div>
      <div className="w-[30%] space-y-4">
        <ConnectionForm
          onAddRelation={addRelationship}
          selectedMember={currentMember}
        />
        <MyRequests currentUserId={userId} requests={sentConnectionRequests} />
        {/* <Leaderboard /> */}
      </div>
    </div>
  );
}
