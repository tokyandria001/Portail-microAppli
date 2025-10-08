'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  GitBranch,
  Settings,
  Users,
  Activity,
  FileText,
  Plug,
  Monitor,
} from "lucide-react"

export default function Sidebar() {
  const pathname = usePathname()

  const links = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/dashboard/repos", label: "Repositories", icon: GitBranch },
    { href: "/dashboard/project", label: "Project", icon: GitBranch },
    { href: "/dashboard/services", label: "Services", icon: Settings },
    { href: "/dashboard/plugins", label: "Plugins", icon: Plug },
    { href: "/dashboard/users", label: "Utilisateurs", icon: Users },
    { href: "/dashboard/builds", label: "Builds", icon: Activity },
    { href: "/dashboard/monitoring", label: "Monitoring", icon: Monitor },
    { href: "/dashboard/logs", label: "Logs", icon: FileText },
  ]

  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">Backstage</h2>
      <nav className="flex flex-col gap-1 px-4">
        {links.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href
          return (
            <Link
              key={`${href}-${label}`}
              href={href}
              className={`sidebar-link ${isActive
                ? 'bg-blue-500 text-white rounded-md'
                : 'text-gray-400 hover:text-white hover:bg-gray-800 rounded-md'
                }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
