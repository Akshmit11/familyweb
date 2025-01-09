import { FamilyTree } from "@/components/shared/FamilyTree";
import { getUserByClerkId } from "@/lib/actions/user.actions";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function MyFamily() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await getUserByClerkId(userId);
  if (!user) redirect("/sign-in");

  return (
    <main className="min-h-screen bg-background geistSans">
      {user.isProfileCompleted ? (
        <FamilyTree userId={user._id} />
      ) : (
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="backdrop-blur-sm bg-white/80 rounded-2xl p-8 max-w-sm text-center border border-gray-100 shadow-lg">
            <h2 className="text-2xl font-medium mb-2 text-gray-800 geistSans">Complete Your Profile</h2>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Please complete your profile information before accessing the family tree.
            </p>
            <Link 
              href={`/profile/${user._id}`}
              className="inline-flex items-center justify-center bg-primary text-white px-6 py-2.5 text-sm rounded-xl hover:translate-y-[-1px] hover:shadow-md transition-all duration-200 font-medium"
            >
              Complete Profile
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
