'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, GitBranch } from "lucide-react"

export default function Sidebar() {
  const pathname = usePathname()

  const links = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/dashboard/repos", label: "Repositories", icon: GitBranch },
  ]

  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">Backstage</h2>
      <nav className="flex flex-col gap-1 px-4">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`sidebar-link ${
              pathname === href ? "bg-green-600 text-white" : ""
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  )
}
