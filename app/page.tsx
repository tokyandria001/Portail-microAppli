import Sidebar from "@/components/sidebar"
import Header from "@/components/header"
import DashboardCard from "@/components/dashboardcard"

export default function HomePage() {
  return (
    <div>
      <Sidebar />
      <Header />
      <main className="main">
        <DashboardCard title="Services" content="32 services connectés" />
        <DashboardCard title="Plugins" content="8 plugins installés" />
        <DashboardCard title="Utilisateurs" content="128 comptes actifs" />
        <DashboardCard title="Builds" content="Dernier build : 10 min" />
        <DashboardCard title="Monitoring" content="Tous les systèmes en ligne" />
        <DashboardCard title="Logs" content="Aucun incident critique" />
      </main>
    </div>
  )
}
