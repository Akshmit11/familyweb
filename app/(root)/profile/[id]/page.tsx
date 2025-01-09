import { Button } from "@/components/ui/button";
import { getUserById } from "@/lib/actions/user.actions";
import { SearchParamProps } from "@/types";
import { auth } from "@clerk/nextjs/server";
import { Calendar, Clock, Mail, MapPin, Phone, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";

// Mock data - Replace with actual data fetching
const userData = {
  firstName: "John",
  lastName: "Doe",
  photo: "/avatar.jpg",
  coverPhoto: "/cover.jpg",
  email: "john.doe@example.com",
  username: "@johndoe",
  phoneNumber: "+1234567890",
  countryCode: "+1",
  country: "United States",
  city: "New York",
  state: "NY",
  status: "Available",
  dob: "1990-01-01",
  familyId: "FAM123",
  createdAt: "2023-01-01",
  posts: [
    {
      id: 1,
      content: "Enjoying a beautiful day with family! 🌞",
      image: "https://placehold.co/800x450.png",
      createdAt: "2024-03-15T10:30:00Z",
      likes: 24,
      comments: 8,
    },
    {
      id: 2,
      content: "Weekend getaway with loved ones ❤",
      image: "https://placehold.co/800x450.png",
      createdAt: "2024-03-10T15:20:00Z",
      likes: 32,
      comments: 12,
    },
  ],
};

// Add this helper function at the top of the file
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const ProfilePage = async ({
  params,
  searchParams,
}: SearchParamProps) => {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id } = await params;
  const user = await getUserById(id);
  if (!user) redirect("/sign-in");

  const isProfileCompleted = user.isProfileCompleted;
  const showPhoneNumber = user.showPhoneNumber;
  const isCurrentUser = user.clerkId === userId;

  return (
    <div className="min-h-screen bg-gray-50 geistSans">
      {/* Cover Photo */}
      <div className="relative h-[250px] w-full">
        <Image
          src={user.coverPhoto || "https://placehold.co/1200x400.png"}
          alt="Cover"
          fill
          className="object-cover"
          priority
        />
        {/* Overlapping Profile Photo */}
        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 lg:left-16 lg:translate-x-0">
          <div className="relative w-32 h-32 rounded-full overflow-hidden ring-4 ring-white">
            <Image
              src={user.photo}
              alt="Profile"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Profile Header */}
        <div className="relative bg-white rounded-2xl shadow-sm p-6 mt-20 mb-6">
          <div className="flex flex-col items-center lg:items-start">
            <div className="text-center lg:text-left">
              <h1 className="text-2xl font-bold text-gray-900 sherika tracking-wide">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-gray-500 mt-1 geistSans">@{user.username}</p>
              <p className="text-gray-500 mt-1 geistSans">
                {user.status ? user.status : "No status set"}
              </p>
              <div className="mt-4 flex flex-wrap gap-3 justify-center lg:justify-start">
                {isCurrentUser && (
                  <Button 
                    variant={isProfileCompleted ? "outline" : "destructive"}
                    size="sm" 
                    className="geistSans"
                    asChild
                  >
                    <Link href={`/profile/${id}/update`}>
                      {isProfileCompleted ? "Edit Profile" : "Complete Profile"}
                    </Link>
                  </Button>
                )}
                <Button size="sm" className="geistSans">
                  Share Profile
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Three Column Layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* First Column - Info Cards & Posts */}
          <div className="w-full lg:w-2/3 space-y-6">
            {/* Info Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="bg-white rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3 text-gray-600">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-sm geistSans">{user.email}</span>
                </div>
                {showPhoneNumber && user.phoneNumber && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm geistSans">
                      {user.countryCode} {user.phoneNumber}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-gray-600">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-sm geistSans">
                    {[
                      user.city && user.city.trim(),
                      user.state && user.state.trim(),
                      user.country && user.country.trim(),
                    ]
                      .filter(Boolean)
                      .join(", ") || "Location Not Set"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-sm geistSans capitalize">
                    Gender: {user.gender ? user.gender : "Not Specified"}
                  </span>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3 text-gray-600">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm geistSans">
                    Date of Birth {user.dob ? formatDate(user.dob) : "Not set"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm geistSans">
                    Joined{" "}
                    {user.createdAt ? formatDate(user.createdAt) : "Not set"}
                  </span>
                </div>
              </div>
            </div>

            {/* Posts Section */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 geistSans">
                Posts
              </h2>
              {userData.posts.map((post) => (
                <div
                  key={post.id}
                  className="p-4 border rounded-xl geistSans bg-white"
                >
                  {/* User Info */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden">
                      <Image
                        src={"https://placehold.co/100x100.png"}
                        alt="User avatar"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium">
                        {userData.firstName} {userData.lastName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(post.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Post Content */}
                  <p className="mb-4">{post.content}</p>

                  {/* Post Image */}
                  <div className="relative aspect-video mb-4">
                    <Image
                      src={post.image}
                      alt="Post content"
                      fill
                      className="rounded-lg object-cover"
                    />
                  </div>

                  {/* Engagement Stats */}
                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <span>❤️ {post.likes} likes</span>
                    <span>💭 {post.comments} comments</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Second Column - Past Events, Family Members, etc. */}
          <div className="w-full lg:w-1/3 space-y-6">
            {/* Past Events */}
            <div className="bg-white rounded-xl p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold geistSans">
                  Past Events
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-sm geistSans"
                >
                  View All
                </Button>
              </div>
              <div className="space-y-4">
                {[1, 2, 3].map((event) => (
                  <div
                    key={event}
                    className="flex items-center gap-4 pb-4 border-b last:border-0"
                  >
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={`https://placehold.co/160x160.png`}
                        alt={`Event ${event}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-medium geistSans">
                        Family Gathering
                      </h3>
                      <p className="text-sm text-gray-500 geistSans">
                        December 25, 2023
                      </p>
                      <p className="text-sm text-gray-600 geistSans">
                        15 attendees
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Family Members */}
            <div className="bg-white rounded-xl p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold geistSans">
                  Family Members
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-sm geistSans"
                >
                  View All
                </Button>
              </div>
              {/* ... family members content ... */}
            </div>

            {/* Photo Gallery */}
            <div className="bg-white rounded-xl p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold geistSans">
                  Photo Gallery
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-sm geistSans"
                >
                  View All
                </Button>
              </div>
              {/* ... photo gallery content ... */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
