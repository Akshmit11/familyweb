import { ProfileForm } from '@/components/shared/ProfileForm'
import { getUserByClerkId, getUserById } from '@/lib/actions/user.actions';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import React from 'react'

type UpdateProfileProps = {
  params: {
    id: string;
  }
}

const UpdateProfile = async ({ params }: UpdateProfileProps) => {

  const { userId } = await auth();
  if (!userId) redirect("/sign-in");


  const currentUser = await getUserByClerkId(userId);
  if (!currentUser) redirect("/sign-in");

  const { id } = await params;

  const user = await getUserById(id);
  if (user._id !== currentUser._id) redirect("/");

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <ProfileForm userId={userId} type="Update" user={user} />
    </main>
  )
}

export default UpdateProfile