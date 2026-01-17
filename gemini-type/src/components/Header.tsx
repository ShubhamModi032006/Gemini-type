"use client";

import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { type User } from "@supabase/supabase-js";

// 1. Accept the user prop
const Header = ({ user }: { user: User | null }) => {
  const router = useRouter();

  // 2. Add handler functions
  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const handleSignIn = () => {
    router.push("/login");
  };

  return (
    <header className="flex justify-between items-center p-4 text-white">
      <div className="flex items-center space-x-4">
        {/* Make the title a link to the homepage */}
        <Link href="/" className="text-2xl font-bold">
          type-test
        </Link>
      </div>
      <div className="flex items-center space-x-4">
        {/* 3. Add conditional logic for auth */}
        {user ? (
          <>
            {/* 4. Add the new Dashboard link */}
            <Link
              href="/dashboard"
              className="text-sm text-gray-300 hover:underline"
            >
              Dashboard
            </Link>
            <Link
              href="/settings"
              className="text-sm text-gray-300 hover:underline"
            >
              Settings
            </Link>
            <span className="text-sm text-gray-300 hidden sm:block">
              {user.email}
            </span>
            <button
              onClick={handleSignOut}
              className="px-3 py-1 text-sm bg-gray-700 rounded-md hover:bg-gray-600 transition-colors"
            >
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={handleSignIn}
            className="px-3 py-1 text-sm bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            Login
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;