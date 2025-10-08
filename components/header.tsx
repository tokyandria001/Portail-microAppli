"use client"

export default function Header() {
  return (
    <header className="header">
      <h1 className="header-title">Dashboard</h1>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-black font-bold">
          T
        </div>
      </div>
    </header>
  )
}
