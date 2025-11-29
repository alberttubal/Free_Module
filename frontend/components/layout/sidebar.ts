import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/notes", label: "Notes" },
  { href: "/upload", label: "Upload Note" },
  { href: "/courses", label: "Courses" },
  { href: "/subjects", label: "Subjects" },
  { href: "/experience", label: "Experience Wall" },
  { href: "/qa", label: "Q&A" },
  { href: "/survival", label: "Survival Guides" }
];

export const Sidebar: React.FC = () => {
  const router = useRouter();
  const current = router.pathname;

  return (
    <aside className="hidden md:flex md:w-64 bg-white border-r min-h-screen flex-col py-6 px-4 shadow-sm">
      <h2 className="text-xl font-semibold text-blue-600 mb-6">FreeModule</h2>

      <nav className="flex flex-col gap-2">
        {links.map((link) => {
          const active = current.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors
                ${active ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"}`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
