import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";

export const Navbar: React.FC = () => {
  const router = useRouter();

  const handleLogout = () => {
    const key = process.env.NEXT_PUBLIC_JWT_STORAGE_KEY || "auth_token";
    localStorage.removeItem(key);
    router.push("/login");
  };

  return (
    <nav className="sticky top-0 z-40 w-full bg-white border-b shadow-sm h-14 flex items-center px-6 justify-between">
      <Link href="/dashboard" className="font-semibold text-lg text-blue-600">
        FreeModule
      </Link>

      <div className="flex items-center gap-4">
        <Link href="/notes" className="text-sm text-gray-700 hover:text-blue-600">
          Notes
        </Link>
        <Link href="/experience" className="text-sm text-gray-700 hover:text-blue-600">
          Experience
        </Link>
        <Link href="/qa" className="text-sm text-gray-700 hover:text-blue-600">
          Q&A
        </Link>
        <Link href="/survival" className="text-sm text-gray-700 hover:text-blue-600">
          Survival
        </Link>

        <button
          onClick={handleLogout}
          className="ml-4 rounded-lg bg-red-500 px-3 py-1.5 text-sm text-white hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;

