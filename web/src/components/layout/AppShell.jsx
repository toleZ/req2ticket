import { Link, Outlet } from 'react-router-dom'

export function AppShell() {
  return (
    <div className="min-h-screen bg-base">
      <header className="hairline-b material-thick sticky top-0 z-10 flex h-14 items-center px-4">
        <Link to="/" className="text-headline text-label">
          Req2Ticket
        </Link>
      </header>
      <main className="mx-auto w-full max-w-5xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
