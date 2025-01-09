"use client";

import {
  addPendingRelation,
  fetchConnectionRequests,
  fetchPendingRelations,
} from "@/lib/actions/relationship.actions";
import { getDirectRelations, getUserById } from "@/lib/actions/user.actions";
import { IRelationship } from "@/lib/database/models/relationship.model";
import { IUser } from "@/lib/database/models/user.model";
import { useEffect, useState } from "react";

interface RelativePosition {
  relationType: string;
  angle: number;
  distance: number;
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

const calculateRelativePositions = (member: IUser) => {
  if (!member) return [];

  const positions: Array<{
    member: {
      _id: string;
      firstName: string;
      lastName: string;
      photo: string;
      username: string;
      gender: string;
    };
    relationType: string;
    position: { x: number; y: number };
  }> = [];

  // helper function to add a position to the positions array
  const addPosition = (
    relative: any,
    relationType: string,
    angle: number,
    distance: number,
    index: number,
    total: number
  ) => {
    const angleOffset = total > 1 ? (index - (total - 1) / 2) * 30 : 0;
    const finalAngle = (angle + angleOffset) * (Math.PI / 180);

    positions.push({
      member: {
        _id: relative._id,
        firstName: relative.firstName,
        lastName: relative.lastName,
        photo: relative.photo,
        username: relative.username,
        gender: relative.gender,
      },
      relationType,
      position: {
        x: 50 + distance * Math.cos(finalAngle),
        y: 50 + distance * Math.sin(finalAngle),
      },
    });
  };

  // Process each relation type
  Object.entries(RELATION_POSITIONS).forEach(([relationType, positionInfo]) => {
    const relations = member[relationType as keyof IUser]; // Accessing relations dynamically
    if (!relations) return;

    const isArray = Array.isArray(relations);

    (isArray ? relations : [relations]).forEach((relativeId, index, all) => {
      // Placeholder to fetch relative details; replace with actual database call
      const relative = getUserById(relativeId as string); // Simulating user retrieval
      if (relative) {
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
  });

  return positions;
};

export default function useFamilyTreeData(userId: string) {
  const [currentMember, setCurrentMember] = useState<IUser | null>(null);
  const [relatives, setRelatives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [path, setPath] = useState<Array<{ id: string; name: string }>>([]);
  const [pendingRelations, setPendingRelations] = useState<IRelationship[]>([]);
  const [connectionRequests, setConnectionRequests] = useState<any>();
  // const [incomingRelations, setIncomingRelations] = useState<Array<{
  //   _id: string;
  //   user: {
  //     _id: string;
  //     firstName: string;
  //     lastName: string;
  //     photo: string;
  //     gender: string;
  //   };
  //   relative: {
  //     _id: string;
  //     firstName: string;
  //     lastName: string;
  //     photo: string;
  //     username: string;
  //     gender: string;
  //     family: { _id: string; name: string; }
  //   } | null;
  //   relationType: string;
  //   status: string;
  //   isDirectRequest: boolean;
  //   needsApproval: boolean;
  //   originalRelationship?: string;
  //   pendingApprovals: string[];
  //   approvedBy: string[];
  // }>>([]);
  const [isAccepting, setIsAccepting] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedMember, setSelectedMember] = useState<IUser | null>(null);

  const navigateTo = async (id: string) => {
    try {
      setLoading(true);
      const memberData = await getDirectRelations(id);
      const currentUser: IUser = await getUserById(id);

      if (!memberData) {
        console.error("No member data found");
        return;
      }

      setCurrentMember(currentUser);
      // setPath(prev => [...prev, {
      //   id: memberData._id,
      //   name: `${memberData.firstName} ${memberData.lastName}`
      // }]);

      // const positions = calculateRelativePositions(memberData);
      // setRelatives(positions);
    } catch (error) {
      console.error("Error navigating to family member:", error);
    } finally {
      setLoading(false);
    }
  };

  // navigate to the user's profile when the userId changes
  useEffect(() => {
    if (userId) {
      navigateTo(userId);
    }
  }, [userId]);

  // fetch pending requests when the userId changes
  useEffect(() => {
    if (userId) {
      fetchPendingRequests(userId);
      getConnectionRequestsList(userId);
    }
  }, [userId]);

  // navigate back to the previous member in the path
  // const goBack = async (id: string, index: number) => {
  //   if (index >= path.length) return;

  //   try {
  //     setLoading(true);
  //     const data = await getFamilyTreeData(id);

  //     if (data) {
  //       setCurrentMember(data);
  //       setPath(prevPath => prevPath.slice(0, index + 1));

  //       const positions = calculateRelativePositions(data);
  //       setRelatives(positions);

  //       const nodes = document.querySelectorAll('.transition-to-center, .transition-to-outside');
  //       nodes.forEach(node => {
  //         node.classList.remove('transition-to-center', 'transition-to-outside');
  //       });
  //     }
  //   } catch (error) {
  //     console.error("Error navigating back in family tree:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // Add a new relationship to the current user
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
        // Fetch the pending relations again to get populated data
        const updatedPendingRelations = await fetchPendingRelations(
          currentMember?._id!
        );
        setPendingRelations(updatedPendingRelations || []);
      }
    } catch (error) {
      console.error("Error adding pending relationship:", error);
    } finally {
      setLoading(false);
    }
  };

  // const acceptPendingRelation = async (relationId: string, directRelationsData?: { relativeId: string, relationType: string }[]) => {
  //   setIsAccepting(relationId);
  //   try {
  //     // Find the relation being accepted
  //     const relation = incomingRelations.find(rel => rel._id === relationId);
  //     if (!relation) {
  //       throw new Error("Relation not found");
  //     }

  //     // Accept the main relationship
  //     const acceptedRelation = await acceptRelation(
  //       relationId,
  //       currentMember?._id!,
  //       directRelationsData
  //     );

  //     if (acceptedRelation) {
  //       // Find any related relationships that need to be accepted
  //       const relatedRelations = incomingRelations.filter(
  //         rel => rel?.originalRelationship === relationId
  //       );

  //       // Accept all related relationships
  //       if (relatedRelations.length > 0) {
  //         for (const relatedRel of relatedRelations) {
  //           await acceptRelation(relatedRel._id, currentMember?._id!);
  //         }
  //       }

  //       // Fetch fresh data with proper population
  //       const [updatedData, updatedIncoming] = await Promise.all([
  //         getFamilyTreeData(currentMember?._id!),
  //         fetchIncomingPendingRelations(currentMember?._id!)
  //       ]);

  //       if (updatedData) {
  //         // Update the current member data
  //         setCurrentMember(updatedData);

  //         // Update the path if needed
  //         const currentPath = path.find(p => p.id === updatedData._id);
  //         if (currentPath) {
  //           setPath(prevPath => prevPath.map(p =>
  //             p.id === updatedData._id
  //               ? { ...p, name: `${updatedData.firstName} ${updatedData.lastName}` }
  //               : p
  //           ));
  //         }

  //         // Recalculate positions with new data
  //         const positions = calculateRelativePositions(updatedData);
  //         setRelatives(positions);
  //       }

  //       // Update incoming relations
  //       setIncomingRelations(updatedIncoming || []);

  //       // Refresh pending relations if needed
  //       const updatedPending = await fetchPendingRelations(currentMember?._id!);
  //       setPendingRelations(updatedPending || []);
  //     }
  //   } catch (error) {
  //     console.error("Error accepting relationship:", error);
  //   } finally {
  //     setIsAccepting(null);
  //   }
  // };

  // const rejectPendingRelation = async (relationId: string) => {
  //   try {
  //     await deletePendingRelation(relationId);
  //     setIncomingRelations((prev) =>
  //       prev.filter((relation) => relation._id !== relationId)
  //     );
  //   } catch (error) {
  //     console.error("Error rejecting relationship:", error);
  //   }
  // };

  // const handleNodeClick = async (memberId: string) => {
  //   const clickedNode = document.querySelector(`[data-member-id="${memberId}"]`);
  //   const centerNode = document.querySelector(`[data-member-id="${currentMember?._id}"]`);

  //   // Find the clicked member data
  //   const clickedMemberData = relatives.find(rel => rel.member._id === memberId);
  //   if (clickedMemberData) {
  //     setSelectedMember(clickedMemberData.member);
  //   } else if (memberId === currentMember?._id) {
  //     const { directRelations, ...memberWithoutRelations } = currentMember;
  //     setSelectedMember(memberWithoutRelations);
  //   }

  //   if (clickedNode && centerNode) {
  //     if (memberId !== currentMember?._id) {
  //       clickedNode.classList.add('transition-to-center');
  //       if (clickedMemberData) {
  //         centerNode.classList.add('transition-to-outside');
  //       }
  //     }
  //   }

  //   setTimeout(() => {
  //     if (memberId === currentMember?._id) {
  //       const currentIndex = path.findIndex(item => item.id === memberId);
  //       if (currentIndex !== -1) {
  //         setPath(path.slice(0, currentIndex + 1));
  //         setCurrentMember(currentMember);
  //         const positions = calculateRelativePositions(currentMember);
  //         setRelatives(positions);
  //       }
  //     } else {
  //       navigateTo(memberId);
  //     }
  //   }, 300);
  // };

  const fetchPendingRequests = async (userId: string) => {
    try {
      const fetchPendingRelationsList = await fetchPendingRelations(userId);
      // console.log(fetchPendingRelationsList);
      setPendingRelations(fetchPendingRelationsList);
    } catch (error) {
      console.error("Error fetching pending requests:", error);
    }
  };

  const getConnectionRequestsList = async (userId: string) => {
    try {
      const fetchConnectionRequestsList = await fetchConnectionRequests(userId);
      setConnectionRequests(fetchConnectionRequestsList);
    } catch (error) {
      console.error("Error fetching connection requests:", error);
    }
  }

  return {
    currentMember,
    relatives,
    loading,
    navigateTo,
    setCurrentMember,
    addRelationship,
    connectionRequests,
    getConnectionRequestsList,
    // pendingRelations,
    // fetchPendingRequests,
    // path,
    // isAccepting,
    // selectedMember,
    // setSelectedMember,
    // setPath,
    // calculateRelativePositions,
    // setRelatives,
    // goBack,
    // acceptPendingRelation,
    // incomingRelations,
    // rejectPendingRelation,
  };
}
