import { NavLink, Outlet } from 'react-router-dom'

const buildNavClass = ({ isActive }: { isActive: boolean }) =>
  `nav-link${isActive ? ' nav-link--active' : ''}`

const AppLayout = () => (
  <div className="app-shell">
    <header className="app-header">
      <div>
        <NavLink to="/products" className="brand-title">
          Product Shelf
        </NavLink>
        <p className="brand-subtitle">Витрина премиальных продуктов</p>
      </div>
      <nav className="app-nav">
        <NavLink to="/products" className={buildNavClass}>
          Продукты
        </NavLink>
        <NavLink to="/create-product" className={buildNavClass}>
          Создать продукт
        </NavLink>
      </nav>
    </header>
    <main className="app-main">
      <Outlet />
    </main>
  </div>
)

export default AppLayout
