"use server";

import Family from "../database/models/family.model";
import Relationship from "../database/models/relationship.model";
import User, { IUser } from "../database/models/user.model";
import { connectToDatabase } from "../database/mongoose";
import { handleError } from "../utils";

export const fetchPendingRelations = async (userId: string) => {
  try {
    await connectToDatabase();

    // Find relationships where the user needs to approve
    const pendingRelationships = await Relationship.find({
      $or: [
        { user: userId, status: "pending" }, // Requests initiated by the user
        { approvalNeededFrom: userId }, // Requests the user needs to approve
      ],
    })
      .populate("user", "_id firstName lastName username photo gender")
      .populate("relative", "_id firstName lastName username photo gender")
      .populate("family", "name")
      .lean();

    if (!pendingRelationships || pendingRelationships.length === 0) {
      return [];
    }

    return JSON.parse(JSON.stringify(pendingRelationships));
  } catch (error) {
    handleError(error);
  }
};

export const addPendingRelation = async (
  userId: string,
  relativeUsername: string,
  relationType: string
) => {
  try {
    await connectToDatabase();

    // Fetch relative by username
    const relative = await User.findOne({ username: relativeUsername });
    if (!relative) throw new Error("Relative not found");

    // Fetch the user by ID
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    // Prevent adding relatives from the same family
    if (
      user.family &&
      relative.family &&
      user.family.toString() === relative.family.toString()
    ) {
      throw new Error("Cannot add relatives from the same family");
    }

    // Check for existing relationship
    const existingRelation = await Relationship.findOne({
      $or: [
        { user: userId, relative: relative._id, relationType },
        { user: relative._id, relative: userId, relationType },
      ],
      status: { $in: ["pending", "approved"] }, // Include both pending and approved statuses
    });

    if (existingRelation) throw new Error("Relation already exists");

    // Collect approvalNeededFrom
    const approvalNeededFrom = [
      user.father,
      user.mother,
      user.spouse,
      ...user.brother,
      ...user.sister,
      ...user.son,
      ...user.daughter,
    ]
      .filter(Boolean) // Filter out null or undefined values
      .map((id) => id.toString()); // Convert to string for consistency

    const receiverApprovalNeededFrom = [
      relative.father,
      relative.mother,
      relative.spouse,
      ...relative.brother,
      ...relative.sister,
      ...relative.son,
      ...relative.daughter,
    ]
      .filter(Boolean)
      .map((id) => id.toString());

    // Add sender and receiver to respective approval lists
    approvalNeededFrom.push(relative._id.toString());
    const combinedApprovalNeededFrom = [
      ...new Set([...approvalNeededFrom, ...receiverApprovalNeededFrom]),
    ]; // Ensure uniqueness

    const approvalGotFrom = [userId];

    // Create the new pending relationship
    const newPendingRelation = await Relationship.create({
      user: userId,
      relative: relative._id,
      relationType,
      family: user.family?._id || null,
      status: "pending",
      approvalNeededFrom: combinedApprovalNeededFrom,
      approvalGotFrom,
    });

    return JSON.parse(JSON.stringify(newPendingRelation));
  } catch (error) {
    handleError(error);
  }
};

export const fetchConnectionRequests = async (userId: string) => {
  try {
    await connectToDatabase();

    // Find relationships where the user needs to approve
    const getConnectionRequest = await Relationship.find({
      relative: userId,
      status: "pending",
    })
      .populate("user", "_id firstName lastName username photo gender")
      .populate("relative", "_id firstName lastName username photo gender")
      .populate("rejectedBy", "_id firstName lastName username photo gender")
      .populate("family", "_id name")
      .lean();

    if (!getConnectionRequest || getConnectionRequest.length === 0) {
      return [];
    }

    return JSON.parse(JSON.stringify(getConnectionRequest));
  } catch (error) {
    handleError(error);
  }
};

export const fetchSentConnectionRequests = async (userId: string) => {
  try {
    await connectToDatabase();

    // Find relationships where the user needs to approve
    const getSentConnectionRequest = await Relationship.find({
      user: userId,
    })
      .populate("user", "_id firstName lastName username photo")
      .populate("relative", "_id firstName lastName username photo")
      .populate("rejectedBy", "_id firstName lastName username photo")
      .populate("family", "_id name")
      .sort({ createdAt: -1 })
      .lean();

    if (!getSentConnectionRequest || getSentConnectionRequest.length === 0) {
      return [];
    }

    return JSON.parse(JSON.stringify(getSentConnectionRequest));
  } catch (error) {
    handleError(error);
  }
};

export const rejectConnectionRequest = async (
  requestId: string,
  userId: string
) => {
  try {
    await connectToDatabase();

    // Find the user to ensure they exist
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    // Find the relationship request
    const relationship = await Relationship.findById(requestId);
    if (!relationship) throw new Error("Connection request not found");

    // Update the status to 'rejected' and set the 'rejectedBy' field
    const updatedRelationship = await Relationship.findByIdAndUpdate(
      requestId,
      {
        status: "rejected",
        rejectedBy: userId,
      },
      { new: true } // Return the updated document
    )
      .populate("user", "_id firstName lastName username photo")
      .populate("relative", "_id firstName lastName username photo")
      .populate("rejectedBy", "_id firstName lastName username photo");

    if (!updatedRelationship)
      throw new Error("Failed to update the connection request");

    // Return the updated relationship object
    return JSON.parse(JSON.stringify(updatedRelationship));
  } catch (error) {
    handleError(error);
  }
};

export const acceptConnectionRequest = async (
  requestId: string,
  userId: string
) => {
  try {
    await connectToDatabase();

    // Step 1: Verify if the request exists
    const relationship = await Relationship.findById(requestId)
    .populate("user", "_id firstName lastName username photo gender")
    .populate("relative", "_id firstName lastName username photo gender")
    .populate("family", "_id name");


    if (!relationship) {
      throw new Error("Request not found");
    }

    // Step 2: Verify if the user who accepted the request exists
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Step 3: Ensure user is in approvalNeededFrom and not in approvalGotFrom
    if (
      !relationship.approvalNeededFrom.some(
        (id: any) => id.toString() === userId
      ) ||
      relationship.approvalGotFrom.some((id: any) => id.toString() === userId)
    ) {
      throw new Error("Invalid request state for acceptance");
    }

    // Step 4: Move the user to approvalGotFrom
    relationship.approvalGotFrom.push(userId);
    relationship.approvalNeededFrom = relationship.approvalNeededFrom.filter(
      (id: any) => id.toString() !== userId
    );

    // Step 5: Check if approvalNeededFrom is empty
    if (relationship.approvalNeededFrom.length === 0) {
      const userA = await User.findById(relationship.user._id).populate(
        "family",
        "_id name"
      );
      const userB = await User.findById(relationship.relative._id).populate(
        "family",
        "_id name"
      );

      if (!userA || !userB) {
        throw new Error("One of the users in the relationship is not found");
      }

      // Determine which family has more members
      const familyA = await Family.findById(userA.family._id).populate(
        "members"
      );
      const familyB = await Family.findById(userB.family._id).populate(
        "members"
      );

      if (!familyA || !familyB) {
        throw new Error("One of the families is not found");
      }

      const familyWithMoreMembers =
        familyA.members.length >= familyB.members.length ? familyA : familyB;
      const familyWithFewerMembers =
        familyA.members.length < familyB.members.length ? familyA : familyB;

      // Move all members from the smaller family to the larger family
      for (const member of familyWithFewerMembers.members) {
        member.family = familyWithMoreMembers._id;
        await member.save();
        await updateFamilyRelations(member._id, familyWithMoreMembers._id);
      }

      // Delete the family with fewer members
      await Family.findByIdAndDelete(familyWithFewerMembers._id);

      // Convert relationship status to accepted
      relationship.status = "accepted";
      
      // Update the seven relationships based on relationType
      await updateSevenRelationships(
        userA._id.toString(),
        userB._id.toString(),
        relationship.relationType,
        userB.gender // Pass gender to determine son/daughter and brother/sister
      );

    }

    // Save the relationship update
    await relationship.save();
  } catch (error) {
    handleError(error);
  }
};

async function updateSevenRelationships(
  userAId: string, // initiator/sender
  userBId: string, // relative/receiver
  relationType: string,
  relativegender: "male" | "female"
) {
  const userA = await User.findById(userAId); // initiator
  const userB = await User.findById(userBId); // relative

  if (!userA || !userB) {
    throw new Error("One of the users not found");
  }

  switch (relationType.toLowerCase()) {
    case "father":
      // A is saying B is their father
      userA.father = userBId; // Set B as A's father
      // Add A to B's children array based on A's gender
      if (userA.gender === "male") {
        if (!userB.son.includes(userAId)) {
          userB.son.push(userAId);
        }
      } else {
        if (!userB.daughter.includes(userAId)) {
          userB.daughter.push(userAId);
        }
      }
      break;

    case "mother":
      // A is saying B is their mother
      userA.mother = userBId; // Set B as A's mother
      // Add A to B's children array based on A's gender
      if (userA.gender === "male") {
        if (!userB.son.includes(userAId)) {
          userB.son.push(userAId);
        }
      } else {
        if (!userB.daughter.includes(userAId)) {
          userB.daughter.push(userAId);
        }
      }
      break;

    case "spouse":
      // Spouse is bidirectional
      userA.spouse = userBId;
      userB.spouse = userAId;
      break;

    case "brother":
    case "sister":
      // Sibling relationships are bidirectional
      if (userB.gender === "male") {
        if (!userA.brother.includes(userBId)) {
          userA.brother.push(userBId);
        }
        // Add A to B's siblings based on A's gender
        if (userA.gender === "male") {
          if (!userB.brother.includes(userAId)) {
            userB.brother.push(userAId);
          }
        } else {
          if (!userB.sister.includes(userAId)) {
            userB.sister.push(userAId);
          }
        }
      } else {
        if (!userA.sister.includes(userBId)) {
          userA.sister.push(userBId);
        }
        // Add A to B's siblings based on A's gender
        if (userA.gender === "male") {
          if (!userB.brother.includes(userAId)) {
            userB.brother.push(userAId);
          }
        } else {
          if (!userB.sister.includes(userAId)) {
            userB.sister.push(userAId);
          }
        }
      }
      break;

    case "son":
    case "daughter":
      // A is saying B is their son/daughter
      if (userA.gender === "male") {
        userB.father = userAId; // Set A as B's father
      } else {
        userB.mother = userAId; // Set A as B's mother
      }
      // Add B to A's children array based on B's gender
      if (userB.gender === "male") {
        if (!userA.son.includes(userBId)) {
          userA.son.push(userBId);
        }
      } else {
        if (!userA.daughter.includes(userBId)) {
          userA.daughter.push(userBId);
        }
      }
      break;
  }

  await userA.save();
  await userB.save();
}

// Recursive function to update family relations
async function updateFamilyRelations(userId: string, newFamilyId: string) {
  const user = await User.findById(userId);

  if (!user) return;

  // Update user's family reference
  user.family = newFamilyId;
  await user.save();

  // Fetch the new family document to update its members array
  const newFamily = await Family.findById(newFamilyId);

  if (!newFamily) {
    throw new Error("Family not found");
  }

  // Add the user to the new family’s members array if not already included
  if (!newFamily.members.includes(user._id)) {
    newFamily.members.push(user._id);
    await newFamily.save();
  }

  // List of relationships to update
  const relationships = [
    user.father,
    user.mother,
    user.spouse,
    ...user.brother,
    ...user.sister,
    ...user.son,
    ...user.daughter,
  ];

  // Recursively update each related user's family
  for (const relative of relationships) {
    if (relative && relative.family.toString() !== newFamilyId) {
      await updateFamilyRelations(relative._id, newFamilyId);
    }
  }
}

export const fetchApprovalRequests = async (userId: string) => {
  try {
    await connectToDatabase();

    // Find relationships where the user needs to approve (i.e., userId is in the approvalNeededFrom array)
    const getApprovalRequestsList = await Relationship.find({
      approvalNeededFrom: { $in: [userId] },  // Check if userId is in the approvalNeededFrom array
      status: "pending", // Only fetch pending requests
    })
      .populate("user", "_id firstName lastName username photo")
      .populate("relative", "_id firstName lastName username photo")
      .populate("family", "_id name")
      .lean();

    if (!getApprovalRequestsList || getApprovalRequestsList.length === 0) {
      return [];
    }

    return JSON.parse(JSON.stringify(getApprovalRequestsList));
  } catch (error) {
    handleError(error);
  }
};