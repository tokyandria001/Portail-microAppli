"use client"
import { useState } from "react"

export default function CreateRepoForm() {
  const [name, setName] = useState("")
  const [desc, setDesc] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch("/api/create-repo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description: desc, visibility: "private" }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error ?? "Unknown error")
      setResult(json.repo)
    } catch (err: any) {
      setError(err.message ?? String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl">
      <form onSubmit={submit} className="space-y-4 bg-neutral-900 p-6 rounded-lg border">
        <div>
          <label className="block text-sm text-neutral-300">Nom du dépôt</label>
          <input value={name} onChange={(e)=>setName(e.target.value)} className="w-full mt-2 p-2 bg-neutral-800 rounded" required/>
        </div>
        <div>
          <label className="block text-sm text-neutral-300">Description</label>
          <input value={desc} onChange={(e)=>setDesc(e.target.value)} className="w-full mt-2 p-2 bg-neutral-800 rounded" />
        </div>
        <div>
          <button type="submit" className="px-4 py-2 bg-green-500 rounded" disabled={loading}>
            {loading ? "Création..." : "Créer le dépôt"}
          </button>
        </div>
        {error && <div className="text-red-400">{error}</div>}
        {result && (
          <div className="text-sm text-green-300">
            Dépôt créé — <a className="underline" href={result.html_url} target="_blank" rel="noreferrer">Voir sur GitHub</a>
          </div>
        )}
      </form>
    </div>
  )
}
