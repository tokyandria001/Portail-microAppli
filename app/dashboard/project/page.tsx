import GenerateProjectForm from "@/components/GenerateProjectForm"

export default function ReposPage() {
  return (
    <main className="main">
      <h1 className="text-2xl font-bold mb-4">Créer un dépôt GitHub</h1>
      <p className="text-gray-400 mb-6">
        Créez un nouveau dépôt avec un pipeline CI/CD préconfiguré.
      </p>
      <GenerateProjectForm />
    </main>
  )
}
