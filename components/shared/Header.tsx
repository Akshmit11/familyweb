"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Menu, Bell } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SignedIn } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const isStartPage = pathname === "/";

  // Helper function to check if link is active
  const isActiveLink = (path: string) => pathname === path;

  return (
    <header
      className={`sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${
        isStartPage ? "hidden" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between h-20 px-6">
        <Link className="flex items-center gap-2" href="/home">
          {/* <Image src="/icon.svg" alt="Logo" width={32} height={32} /> */}
          <h1 className="geistSans text-2xl text-primary font-bold">familyweb</h1>
        </Link>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-8 mr-2">
            <Link
              className={`font-medium text-sm transition-colors geistSans ${
                isActiveLink('/events') ? 'text-primary' : 'hover:text-primary'
              }`}
              href="/events"
            >
              Events
            </Link>
            <Link
              className={`font-medium text-sm transition-colors geistSans ${
                isActiveLink('/my-family') ? 'text-primary' : 'hover:text-primary'
              }`}
              href="/my-family"
            >
              My Family
            </Link>
          </nav>

          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-gray-100 hover:text-primary transition-colors"
          >
            <Bell className="h-5 w-5" />
          </Button>

          <SignedIn>
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "h-9 w-9",
                  userButtonPopoverCard: "geistSans",
                  userButtonPopoverActions: "geistSans",
                  userButtonPopoverActionButton:
                    "geistSans",
                  userButtonPopoverActionButtonText: "geistSans",
                  userButtonPopoverFooter: "geistSans",
                },
              }}
            />
          </SignedIn>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetTitle className="geistSans text-2xl text-primary font-bold">
                familyweb
              </SheetTitle>
              <SheetDescription></SheetDescription>
              <div className="flex flex-col h-full pt-8">
                <nav className="flex flex-col gap-6">
                  <Link
                    className={`font-medium text-lg transition-colors geistSans ${
                      isActiveLink('/events') ? 'text-primary' : 'hover:text-primary'
                    }`}
                    href="/events"
                    onClick={() => setIsOpen(false)}
                  >
                    Events
                  </Link>
                  <Link
                    className={`font-medium text-lg transition-colors geistSans ${
                      isActiveLink('/my-family') ? 'text-primary' : 'hover:text-primary'
                    }`}
                    href="/my-family"
                    onClick={() => setIsOpen(false)}
                  >
                    My Family
                  </Link>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
