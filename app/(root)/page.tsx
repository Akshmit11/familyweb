import { Button } from "@/components/ui/button";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await currentUser()

  if (user) {
    redirect('/home');
  }
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-white to-gray-50 p-4">
      <div className="text-center space-y-6">
        <h1 className="geistSans text-5xl text-primary mb-2 font-bold">familyweb</h1>
        <p className="text-gray-600 text-md max-w-md mx-auto text-center geistSans">
          Connect, document, and celebrate your family's legacy in one dedicated
          space
        </p>
        <section className="flex gap-4 mt-8 justify-center">
          <Button
            className="rounded-full text-base geistSans"
            size="lg"
            variant="default"
            asChild
          >
            <Link href="/sign-up">Sign up</Link>
          </Button>
          <Button
            className="rounded-full text-base geistSans"
            size="lg"
            variant="outline"
            asChild
          >
            <Link href="/sign-in">Sign in</Link>
          </Button>
        </section>
      </div>
    </div>
  );
}
