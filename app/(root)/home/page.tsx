import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

const HomePage = async () => {

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6 max-w-[1800px] mx-auto geistSans">
      {/* First Column - Profile Section */}
      <div className="lg:w-1/4">
        {/* Profile Completion Warning - Now visible on all screens */}
        {true && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700">
            <div className="text-sm font-medium mb-2">
              ⚠️ Your profile is incomplete. Please complete it to unlock all features.
            </div>
            <Button 
              variant="destructive" 
              size="sm" 
              className="w-full"
              asChild
            >
              <Link href={`/profile/`}>Complete Profile</Link>
            </Button>
          </div>
        )}

        {/* Rest of Profile Section - Hidden on mobile */}
        <div className="hidden lg:block">
          {/* Profile Card */}
          <div className="relative rounded-2xl bg-white shadow-sm border">
            {/* Cover Image */}
            <div className="relative h-32 rounded-t-2xl overflow-hidden">
              <Image 
                src={"https://placehold.co/1200x400.png"} 
                alt="Cover" 
                fill 
                className="object-cover"
              />
            </div>
            
            {/* Profile Photo - Overlapping */}
            <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 top-32">
              <div className="relative w-24 h-24 rounded-full overflow-hidden ring-4 ring-white">
                <Image 
                  src={"https://placehold.co/300x300.png"} 
                  alt="Profile" 
                  fill 
                  className="object-cover"
                />
              </div>
            </div>

            {/* Profile Content */}
            <div className="pt-14 pb-6 px-6 text-center">
              {/* Name */}
              <h2 className="font-semibold text-xl mb-2 sherika tracking-wide">John Doe</h2>
              
              {/* Status */}
              <p className="text-gray-600 text-sm mb-4 geistSans opacity-80">No status set</p>
              
              {/* Stats */}
              <div className="flex justify-center gap-8 text-sm">
                <div>
                  <p className="font-medium text-gray-900">Post Number</p>
                  <p className="text-gray-500 text-xs">Posts</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{1}</p>
                  <p className="text-gray-500 text-xs">Family Members</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          <div className="mt-4 text-center text-xs text-gray-400">
            <Link href="/terms" className="hover:text-gray-600 transition-colors">Terms</Link>
            <span className="mx-2">•</span>
            <Link href="/privacy" className="hover:text-gray-600 transition-colors">Privacy</Link>
          </div>
        </div>
      </div>

      {/* Second Column - Content Section */}
      <div className="w-full lg:w-2/4 space-y-6">
        {/* Stories/Videos Scroll */}
        <div className="overflow-x-auto">
          <div className="flex gap-4 pb-4">
            {[1,2,3,4,5].map((item) => (
              <div key={item} className="flex-shrink-0 w-[200px] h-[356px] relative geistSans">
                <Image 
                  src={`https://placehold.co/200x356.png`}
                  alt={`Story ${item}`}
                  fill
                  className="rounded-xl object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* New Post Button */}
        <Button className="w-full geistSans">
          Post New Content
        </Button>

        {/* Posts Feed */}
        <div className="space-y-6">
          {[1,2,3].map((post) => (
            <div key={post} className="p-4 border rounded-xl geistSans">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative w-10 h-10 rounded-full overflow-hidden">
                  <Image 
                    src="https://placehold.co/100x100.png"
                    alt="User avatar"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium">User Name</p>
                  <p className="text-sm text-gray-500">2 hours ago</p>
                </div>
              </div>
              <div className="relative aspect-video mb-4">
                <Image 
                  src="https://placehold.co/800x450.png"
                  alt="Post content"
                  fill
                  className="rounded-lg object-cover"
                />
              </div>
              <p>Post content goes here...</p>
            </div>
          ))}
        </div>
      </div>

      {/* Third Column - Ads & Leaderboard */}
      <div className="hidden lg:block lg:w-1/4 space-y-6 geistSans">
        {/* Ad Space */}
        <div className="h-[300px] bg-gray-100 rounded-xl p-4 text-center">
          <h1 className="flex items-center justify-center h-full">Advertisement Space</h1>
        </div>

        {/* Leaderboard Component */}
        {/* <Leaderboard /> */}
      </div>
    </div>
  )
}

export default HomePage