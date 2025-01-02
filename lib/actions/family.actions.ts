"use server";

import User, { IUser } from "../database/models/user.model";
import { connectToDatabase } from "../database/mongoose";
import { handleError } from "../utils";

export async function getFamilyTreeData(userId: string) {
  try {
    await connectToDatabase();

    const user = await User.findById(userId)
      .populate({
        path: 'directRelations.$*.relative',
        select: '_id firstName lastName photo username gender family'
      })
      .lean<IUser>();

    if (!user) throw new Error("User not found");

    // Transform the directRelations from Map to Record structure
    const transformedDirectRelations: IUser['directRelations'] = {};
    
    const relationTypes = [
      "father",
      "mother",
      "spouse",
      "son",
      "daughter",
      "brother",
      "sister"
    ] as const;

    relationTypes.forEach(type => {
      const relations = user.directRelations?.[type] || [];
      if (Array.isArray(relations)) {
        transformedDirectRelations[type] = relations.map(rel => ({
          _id: rel._id?.toString() || '',
          relationType: type,
          status: rel.status || 'accepted',
          relative: {
            _id: rel.relative?._id?.toString() || '',
            firstName: rel.relative?.firstName || '',
            lastName: rel.relative?.lastName || '',
            photo: rel.relative?.photo || '',
            username: rel.relative?.username || '',
            gender: rel.relative?.gender || '',
            family: {
              _id: rel.relative?.family?._id?.toString() || '',
              name: rel.relative?.family?.name || ''
            }
          }
        }));
      }
    });

    // Create a serialized plain object
    const serializedUser = {
      _id: user._id?.toString() || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      photo: user.photo || '',
      username: user.username || '',
      gender: user.gender || '',
      family: {
        _id: user.family?._id?.toString() || '',
        name: user.family?.name || ''
      },
      directRelations: transformedDirectRelations
    };

    // Convert to and from JSON to remove any non-serializable properties
    return JSON.parse(JSON.stringify(serializedUser));
  } catch (error) {
    handleError(error);
  }
}
