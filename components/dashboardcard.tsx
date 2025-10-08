"use client"

interface Props {
  title: string
  content: string
}

export default function DashboardCard({ title, content }: Props) {
  return (
    <div className="card">
      <h3 className="card-title">{title}</h3>
      <p className="card-content">{content}</p>
    </div>
  )
}
