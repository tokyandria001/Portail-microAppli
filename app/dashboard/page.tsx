import { Card } from "@/components/ui/card"

export default function Dashboard() {
  return (
    <div className="grid grid-cols-3 gap-4">
      <Card title="Services" value="24" description="Microservices déployés" />
      <Card title="Pipelines" value="12" description="Builds en cours" />
      <Card title="Incidents" value="0" description="Aucun problème 🎉" />
    </div>
  )
}
