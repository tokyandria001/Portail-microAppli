'use client'

import { useEffect, useState } from "react"

export default function GenerateProjectForm() {
  const [templates, setTemplates] = useState<string[]>([])
  const [template, setTemplate] = useState("")
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [useTemplateRepo, setUseTemplateRepo] = useState(false)

  useEffect(() => {
    fetch("/api/generate-project")
      .then(res => res.json())
      .then(json => setTemplates(json.templates || []))
      .catch(() => setTemplates([]))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(null); setResult(null)
    try {
      const res = await fetch("/api/generate-project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template,
          repoName: name,
          description,
          visibility: "private",
          useTemplateRepo,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Unknown")
      setResult(json.repo)
    } catch (err: any) {
      setError(err.message ?? String(err))
    } finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-neutral-900 p-6 rounded-lg border max-w-2xl">
      <div>
        <label className="text-sm text-neutral-300">Template</label>
        <select value={template} onChange={(e)=>setTemplate(e.target.value)} className="w-full mt-2 p-2 bg-neutral-800 rounded">
          <option value="">-- Choisir --</option>
          {templates.map(t => <option key={t} value={t}>{t}</option>)}
          <option disabled>────────────</option>
          <option value="your-org/your-template-repo">Utiliser un GitHub Template Repo (owner/repo)</option>
        </select>
      </div>

      <div>
        <label className="text-sm text-neutral-300">Nom du projet (repo)</label>
        <input value={name} onChange={e=>setName(e.target.value)} required className="w-full mt-2 p-2 bg-neutral-800 rounded" />
      </div>

      <div>
        <label className="text-sm text-neutral-300">Description</label>
        <input value={description} onChange={e=>setDescription(e.target.value)} className="w-full mt-2 p-2 bg-neutral-800 rounded" />
      </div>

      <div className="flex items-center gap-2">
        <input type="checkbox" checked={useTemplateRepo} onChange={e=>setUseTemplateRepo(e.target.checked)} id="useTemplate" />
        <label htmlFor="useTemplate" className="text-sm text-neutral-300">Utiliser GitHub Template Repo (owner/repo)</label>
      </div>

      <div>
        <button className="bg-green-500 px-4 py-2 rounded" disabled={loading || !template || !name}>
          {loading ? "Génération..." : "Générer & Créer le repo"}
        </button>
      </div>

      {error && <div className="text-red-400">{error}</div>}
      {result && (
        <div className="text-sm text-green-300">
          ✅ Repo créé — <a href={result.html_url} target="_blank" rel="noreferrer" className="underline">Voir sur GitHub</a>
        </div>
      )}
    </form>
  )
}
