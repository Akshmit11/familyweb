import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { IUser } from "@/lib/database/models/user.model";
import { IRelationship } from "@/lib/database/models/relationship.model";

const styles = {
  node: "absolute transition-all duration-300 ease-in-out flex flex-col items-center justify-center geist-sans",
  avatar: "border-2 border-gray-200 transition-all duration-300 ease-in-out",
  mainAvatar: "w-24 h-24 border-4",
  avatarImage: "object-cover",
  info: "mt-2 text-center",
  name: "font-semibold text-sm geist-sans",
  relation: "text-xs text-gray-500 geist-sans",
};

// Update ProfileNodeProps interface
interface ProfileNodeProps {
  member: {
    _id: string;
    firstName: string;
    lastName: string;
    photo: string;
    username: string;
    gender: string;
    family: { _id: string; name: string; } | null;
  };
  isMainUser?: boolean;
  onNodeClick: (memberId: string) => void;
  position: { x: number; y: number };
  relationType?: string;
  isPending?: boolean;
  'data-member-id'?: string;
}

export function ProfileNode({
  member,
  isMainUser,
  onNodeClick,
  position = { x: 50, y: 50 },
  relationType,
  isPending = false,
}: ProfileNodeProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (member?._id && !isPending) {
      onNodeClick(member?._id);
    }
  };

  const firstNameInitial = member?.firstName?.[0] ?? "N";
  const lastNameInitial = member?.lastName?.[0] ?? "A";

  return (
    <div
      className={`${styles.node} ${isMainUser ? "z-10" : "z-0"} cursor-pointer`}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: `translate(-50%, -50%) scale(${isMainUser ? 1.2 : 1})`,
      }}
      onClick={handleClick}
      data-member-id={member?._id}
    >
      <Avatar 
        className={`${styles.avatar} ${isMainUser ? styles.mainAvatar : ""} ${
          isPending ? "border-yellow-400 border-2" : ""
        }`}
      >
        <AvatarImage
          src={member?.photo || "/placeholder.svg"}
          alt={`${member?.firstName || "Unknown"} ${member?.lastName || "User"}`}
          className={styles.avatarImage}
        />
        <AvatarFallback>
          {firstNameInitial}
          {lastNameInitial}
        </AvatarFallback>
      </Avatar>
      <div className={styles.info}>
        <div className={styles.name}>
          {member?.firstName || "Unknown"} {member?.lastName || "User"}
        </div>
        {!isMainUser && relationType && (
          <div className={`${styles.relation} ${isPending ? "text-yellow-600" : ""}`}>
            {relationType} {isPending ? "(Pending)" : ""}
          </div>
        )}
      </div>
    </div>
  );
}