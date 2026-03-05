import { NavLink, Outlet } from 'react-router-dom'

export default function AppShell() {
  return (
    <div className="app-shell">
      <header className="top-nav">
        <div className="top-nav__brand">
          <span className="top-nav__badge" />
          <span>DocCanvas</span>
        </div>
        <nav className="top-nav__links" aria-label="Main navigation">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `top-nav__link ${isActive ? 'top-nav__link--active' : ''}`
            }
          >
            PDF Workspace
          </NavLink>
          <NavLink
            to="/canvas"
            className={({ isActive }) =>
              `top-nav__link ${isActive ? 'top-nav__link--active' : ''}`
            }
          >
            Canvas Tools
          </NavLink>
        </nav>
      </header>
      <main className="app-shell__content">
        <Outlet />
      </main>
    </div>
  )
}
