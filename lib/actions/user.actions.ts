"use server";

import { CreateUserParams, UpdateUserParams } from "@/types";
import { revalidatePath } from "next/cache";
import Comment from "../database/models/comment.model";
import Event from "../database/models/event.model";
import Family from "../database/models/family.model";
import Post from "../database/models/post.model";
import Relationship from "../database/models/relationship.model";
import User from "../database/models/user.model";
import { connectToDatabase } from "../database/mongoose";
import { handleError } from "../utils";
import mongoose from "mongoose";

// Helper function to generate a random 10-digit ID
const generateRandomFamilyId = (): string => {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString(); // 10-digit number
};
// Function to generate a unique 10-digit familyId
const generateUniqueFamilyId = async (): Promise<string> => {
  let isUnique = false;
  let familyId = "";

  while (!isUnique) {
    familyId = generateRandomFamilyId();
    const existingUser = await User.findOne({ familyId });
    if (!existingUser) {
      isUnique = true;
    }
  }

  return familyId;
};

// createUser function
export async function createUser(user: CreateUserParams) {
  try {
    await connectToDatabase();

    
    // Create the new user with the generated familyId
    const newUser = await User.create(user);

    // Generate a unique 10-digit familyId
    const familyId = await generateUniqueFamilyId();

    // Create a new Family record and link it to the user
    const newFamily = await Family.create({
      name: familyId,
      members: [newUser._id],
      createdBy: newUser._id,
    });

    const updatedUser = await User.findByIdAndUpdate(newUser._id, { family: newFamily._id }, { new: true });
    // Ensure the user's familyId is correctly updated to match the Family's ID
    // newUser.family = newFamily._id;
    // await newUser.save();

    return JSON.parse(JSON.stringify(updatedUser));
  } catch (error) {
    handleError(error);
  }
}

// update user
export async function updateUser(clerkId: string, user: UpdateUserParams, path?: string) {
  try {
    await connectToDatabase();

    const updatedUser = await User.findOneAndUpdate(
      { clerkId },
      { ...user, updatedAt: new Date() },
      { new: true }
    );

    if (!updatedUser) {
      throw new Error("User update failed");
    }

    if (path) revalidatePath(path);

    return JSON.parse(JSON.stringify(updatedUser));
  } catch (error) {
    handleError(error);
  }
}

// delete user
export async function deleteUser(clerkId: string) {
  try {
    await connectToDatabase();

    // Find the user to delete
    const userToDelete = await User.findOne({ clerkId });
    if (!userToDelete) {
      throw new Error("User not found");
    }

    const userId = userToDelete._id;

    // Start a database transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Delete posts created by the user
      await Post.deleteMany({ createdBy: userId }).session(session);

      // Delete comments made by the user
      await Comment.deleteMany({ user: userId }).session(session);

      // Remove the user from family members and delete empty families
      await Family.updateMany(
        { members: userId },
        { $pull: { members: userId } },
        { createdBy: userId }
      ).session(session);
      await Family.deleteMany({ members: { $size: 0 } }).session(session);

      // Delete relationships involving the user
      await Relationship.deleteMany({
        $or: [{ user: userId }, { relative: userId }],
      }).session(session);

      // Remove the user from event attendees
      await Event.updateMany(
        { attendees: userId },
        { $pull: { attendees: userId } }
      ).session(session);

      // Finally, delete the user
      const deletedUser = await User.findByIdAndDelete(userId).session(session);

      // Commit the transaction
      await session.commitTransaction();

      // Revalidate paths (for ISR)
      const pathsToRevalidate = ["/"];
      for (const path of pathsToRevalidate) {
        revalidatePath(path);
      }

      return deletedUser ? JSON.parse(JSON.stringify(deletedUser)) : null;
    } catch (error) {
      handleError(error);
    } finally {
      session.endSession();
    }
  } catch (error) {
    handleError(error);
  }
}


// get user by id
export const getUserById = async (userId: string) => {
  try {
    await connectToDatabase();

    const user = await User.findById(userId);

    if (!user) throw new Error("User not found");
    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    handleError(error);
  }
};

// get user by clerkId
export const getUserByClerkId = async (userId: string) => {
  try {
    await connectToDatabase();

    const user = await User.findOne({ clerkId: userId })
      .populate({
        path: 'family',
        select: 'members'
      });
      
    if (!user) throw new Error("User not found");
    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    handleError(error);
  }
};

