"use server";

import Family from "../database/models/family.model";
import Relationship, { IRelationship } from "../database/models/relationship.model";
import User, { IUser } from "../database/models/user.model";
import { handleError } from "../utils";

// Add this helper function at the top
function serializeDocument(doc: any) {
  if (!doc) return null;
  const serialized = JSON.parse(JSON.stringify(doc));
  // Convert any remaining _id fields to strings
  if (serialized._id) {
    serialized._id = serialized._id.toString();
  }
  return serialized;
}

// Add this helper function to determine the relationship between two family members
function determineRelationship(
  requestingRelationType: string,
  existingRelationType: string,
  gender: string
): string | null {
  const relationshipMap: Record<string, Record<string, string>> = {
    // When adding a parent and there's a spouse
    father: {
      mother: 'spouse',
      son: 'son',
      daughter: 'daughter',
    },
    mother: {
      father: 'spouse',
      son: 'son',
      daughter: 'daughter',
    },
    // When adding a sibling and there's a parent
    brother: {
      father: 'son',
      mother: 'son',
    },
    sister: {
      father: 'daughter',
      mother: 'daughter',
    },
    // When adding a child and there's a spouse
    son: {
      father: 'son',
      mother: 'son',
      brother: 'brother',
      sister: 'sister',
    },
    daughter: {
      father: 'daughter',
      mother: 'daughter',
      brother: 'sister',
      sister: 'sister',
    },
  };

  return relationshipMap[requestingRelationType]?.[existingRelationType] || null;
}

// Function to add a pending relationship
export async function addPendingRelation(
  userId: string,
  relativeUsername: string,
  relationType: string
) {
  try {
    const relative = await User.findOne({ username: relativeUsername });
    if (!relative) throw new Error("Relative not found");

    const user = await User.findById(userId)
      .populate({
        path: "directRelations",
        populate: {
          path: "relative",
          select: "_id firstName lastName username photo gender family",
        },
      })
      .lean<IUser>();

    if (!user || (user.family && user.family._id.toString() === relative.family._id.toString())) {
      throw new Error("Cannot add relatives from the same family");
    }

    const existingRelation = await Relationship.findOne({
      user: userId,
      relative: relative._id,
      relationType,
    });
    if (existingRelation) throw new Error("Relation already exists");

    // Manually extract all direct relations from the `directRelations` Map
    const pendingApprovals: string[] = [];
    const existingFamilyMembers: Array<{
      memberId: string;
      relationType: string;
      relationToNew: string; // Add this field to store the relationship to the new member
    }> = [];
    
    // Process existing family members
    Object.entries(user.directRelations || {}).forEach(([type, relations]) => {
      if (Array.isArray(relations)) {
        relations.forEach(rel => {
          if (rel?.relative?._id) {
            const relationToNew = determineRelationship(
              relationType, 
              type, 
              relative.gender
            );
            
            if (relationToNew) {
              pendingApprovals.push(rel.relative._id.toString());
              existingFamilyMembers.push({
                memberId: rel.relative._id.toString(),
                relationType: type,
                relationToNew
              });
            }
          }
        });
      }
    });

    // Add the target relative if not already included
    if (!pendingApprovals.includes(relative._id.toString())) {
      pendingApprovals.push(relative._id.toString());
    }

    // Create main relationship request
    const newRelation = await Relationship.create({
      user: userId,
      relative: relative._id,
      relationType,
      family: user.family?._id,
      status: "pending",
      pendingApprovals,
      approvedBy: [userId],
      isDirectRequest: true,
      existingFamilyMembers
    });

    // Create reciprocal relationship requests
    const reciprocalRequests = existingFamilyMembers.map(member => ({
      user: relative._id,
      relative: member.memberId,
      relationType: member.relationToNew, // Use the determined relationship
      family: user.family?._id,
      status: "pending",
      pendingApprovals: [member.memberId],
      approvedBy: [relative._id],
      isDirectRequest: false,
      originalRelationship: newRelation._id
    }));

    await Relationship.insertMany(reciprocalRequests);

    return await Relationship.findById(newRelation._id)
      .populate("user", "_id firstName lastName username photo gender")
      .populate("relative", "_id firstName lastName username photo gender")
      .populate("family", "name")
      .lean();

    // return serializeDocument(populatedRelation);
  } catch (error) {
    handleError(error);
  }
}

// First, update the getInverseRelationType function to properly handle gender
function getInverseRelationType(
  relationType: string,
  relativeGender: string
): string {
  // console.log('Getting inverse for:', { relationType, relativeGender }); // Debug log

  const relationMap: { [key: string]: { male: string; female: string } } = {
    father: { male: "son", female: "daughter" },
    mother: { male: "son", female: "daughter" },
    son: { male: "father", female: "mother" },
    daughter: { male: "father", female: "mother" },
    brother: { male: "brother", female: "sister" },
    sister: { male: "brother", female: "sister" },
    spouse: { male: "spouse", female: "spouse" },
  };

  // Use the relative's gender to determine the correct inverse
  const gender = relativeGender.toLowerCase();
  if (!relationMap[relationType] || !['male', 'female'].includes(gender)) {
    console.warn(`Invalid relation or gender: ${relationType}, ${gender}`);
    return relationType;
  }

  return relationMap[relationType][gender as 'male' | 'female'];
}

// Helper function to determine if approval is needed from close relations
function needsCloseRelationsApproval(relationType: string) {
  const closeRelationTypes = [
    "father",
    "mother",
    "brother",
    "sister",
    "spouse",
    "son",
    "daughter",
  ];
  return closeRelationTypes.includes(relationType);
}

// Update the finalizeRelationship function to properly handle family merging
async function finalizeRelationship(relationship: IRelationship, directRelationsData?: { relativeId: string, relationType: string }[]) {
  try {
    const [user, relative] = await Promise.all([
      User.findById(relationship.user._id).populate('family'),
      User.findById(relationship.relative._id).populate('family')
    ]);

    if (!user || !relative) throw new Error("User or relative not found");

    // Get all related relationships
    const relatedRelationships = await Relationship.find({
      originalRelationship: relationship._id
    }).lean();

    // Collect all relationships to be created
    const relationshipsToCreate = [
      {
        userId: user._id,
        relativeId: relative._id,
        relationType: relationship.relationType
      },
      {
        userId: relative._id,
        relativeId: user._id,
        relationType: getInverseRelationType(relationship.relationType, relative.gender)
      }
    ];

    // Add relationships from related approvals
    relatedRelationships.forEach(rel => {
      relationshipsToCreate.push({
        userId: rel.user,
        relativeId: rel.relative,
        relationType: rel.relationType
      });
      relationshipsToCreate.push({
        userId: rel.relative,
        relativeId: rel.user,
        relationType: getInverseRelationType(rel.relationType, rel.user.gender)
      });
    });

    // Determine which family to keep (prefer the larger family)
    const userFamilyMembers = await User.countDocuments({ family: user.family._id });
    const relativeFamilyMembers = await User.countDocuments({ family: relative.family._id });

    const targetFamilyId = userFamilyMembers >= relativeFamilyMembers 
      ? user.family._id 
      : relative.family._id;
    const sourceFamilyId = userFamilyMembers >= relativeFamilyMembers 
      ? relative.family._id 
      : user.family._id;

    // Update all users' directRelations and family
    const updatePromises = relationshipsToCreate.map(({ userId, relativeId, relationType }) =>
      User.findByIdAndUpdate(
        userId,
        {
          $addToSet: {
            [`directRelations.${relationType}`]: {
              relative: relativeId,
              relationType,
              status: "accepted"
            }
          },
          $set: { 
            family: targetFamilyId,
            updatedAt: new Date()
          }
        },
        { new: true }
      )
    );

    // Add any additional direct relations if provided
    if (directRelationsData) {
      directRelationsData.forEach(({ relativeId, relationType }) => {
        updatePromises.push(
          User.findByIdAndUpdate(
            relative._id,
            {
              $addToSet: {
                [`directRelations.${relationType}`]: {
                  relative: relativeId,
                  relationType,
                  status: "accepted"
                }
              }
            },
            { new: true }
          )
        );
      });
    }

    // Move all members from source family to target family
    updatePromises.push(
      User.updateMany(
        { family: sourceFamilyId },
        { 
          $set: { 
            family: targetFamilyId,
            updatedAt: new Date()
          }
        }
      )
    );

    // Update the target family's members array
    updatePromises.push(
      Family.findByIdAndUpdate(
        targetFamilyId,
        {
          $addToSet: { 
            members: { 
              $each: relationshipsToCreate.map(r => r.userId) 
            } 
          }
        }
      )
    );

    // Delete the source family
    updatePromises.push(Family.findByIdAndDelete(sourceFamilyId));

    // Execute all updates
    await Promise.all(updatePromises);

    // Update the relationship status
    relationship.status = "accepted";
    await relationship.save();

    // Update related relationships status
    if (relatedRelationships.length > 0) {
      await Relationship.updateMany(
        { originalRelationship: relationship._id },
        { $set: { status: "accepted" } }
      );
    }

    return {
      status: "accepted",
      relationship: JSON.parse(JSON.stringify({
        _id: relationship._id,
        status: "accepted",
        relationType: relationship.relationType,
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          photo: user.photo,
          family: targetFamilyId
        },
        relative: {
          _id: relative._id,
          firstName: relative.firstName,
          lastName: relative.lastName,
          username: relative.username,
          photo: relative.photo,
          family: targetFamilyId
        }
      }))
    };
  } catch (error) {
    console.error("Error in finalizeRelationship:", error);
    throw error;
  }
}

// Update the acceptRelation function
export async function acceptRelation(
  relationshipId: string,
  approverId: string,
  directRelationsData?: { relativeId: string; relationType: string }[]
) {
  try {
    // Get the relationship document WITHOUT lean() so we can modify it
    const relationship = await Relationship.findById(relationshipId)
      .populate("user")
      .populate("relative")
      .populate("family");

    if (!relationship) throw new Error("Relationship not found");
    if (relationship.status !== "pending") throw new Error("Relationship is not pending");

    // Initialize arrays if they don't exist
    if (!relationship.pendingApprovals) relationship.pendingApprovals = [];
    if (!relationship.approvedBy) relationship.approvedBy = [];

    // Move the approver from pending to approved
    relationship.pendingApprovals = relationship.pendingApprovals.filter(
      (id: string) => id.toString() !== approverId
    );
    if (!relationship.approvedBy.includes(approverId)) {
      relationship.approvedBy.push(approverId);
    }

    await relationship.save();

    // If there are still pending approvals, return early
    if (relationship.pendingApprovals.length > 0) {
      return serializeDocument({
        status: "waiting_for_approvals",
        remainingApprovals: relationship.pendingApprovals.length,
      });
    }

    // Convert to plain object for finalizeRelationship
    const plainRelationship = relationship.toObject();

    // Proceed with finalization
    const result = await finalizeRelationship(plainRelationship, directRelationsData);
    return serializeDocument(result);
  } catch (error) {
    handleError(error);
  }
}

// Update fetchPendingRelations
export async function fetchPendingRelations(userId: string) {
  try {
    const pendingRelationships = await Relationship.find({
      user: userId,
      status: "pending",
    })
      .populate("relative", "firstName lastName username photo")
      .populate("family", "name")
      .lean();

    return serializeDocument(pendingRelationships);
  } catch (error) {
    handleError(error);
    return [];
  }
}

// Update fetchIncomingPendingRelations
export async function fetchIncomingPendingRelations(userId: string) {
  try {
    const pendingRelationships = await Relationship.find({
      $and: [
        { status: "pending" },
        {
          $or: [{ relative: userId }, { pendingApprovals: userId }],
        },
      ],
    })
      .populate("user", "_id firstName lastName username photo gender")
      .populate("relative", "_id firstName lastName username photo gender")
      .populate("family", "_id name")
      .lean();

    const transformedRelationships = pendingRelationships.map((relation) => ({
      ...relation,
      isDirectRequest: relation.relative._id.toString() === userId,
      needsApproval: relation.pendingApprovals?.includes(userId),
    }));

    return serializeDocument(transformedRelationships);
  } catch (error) {
    handleError(error);
    return [];
  }
}

// Function to delete a pending relationship
export async function deletePendingRelation(relationshipId: string) {
  try {
    await Relationship.findByIdAndDelete(relationshipId);
  } catch (error) {
    handleError(error);
  }
}

// Update any other functions that return MongoDB documents
// For example, if you have a function that returns user data:
export async function getUserData(userId: string) {
  try {
    const userData = await User.findById(userId)
      .populate('family')
      .lean();
    
    return serializeDocument(userData);
  } catch (error) {
    handleError(error);
    return null;
  }
}