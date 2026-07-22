import { Outlet, NavLink } from 'react-router-dom';
import { ChevronDown, Moon } from 'lucide-react';

const Layout = () => {
  return (
    <div className="tefas-layout">
      {/* Top Navigation */}
      <header className="tefas-header">
        <div className="header-container">
          {/* Logo Area */}
          <div className="logo-area">
            <NavLink to="/" className="logo-link">
              <img src="/assets/photos/logo-tefas-dark.svg" alt="TEFAS" />
              <img src="/assets/photos/logo-befas-dark.svg" alt="BEFAS" />
            </NavLink>
          </div>

          <div className="header-controls">
            {/* Navigation Links */}
            <nav className="top-nav">
              <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')} end>
                Ana Sayfa
              </NavLink>
              <div className="nav-link">
                Fon Getirileri <ChevronDown size={14} />
              </div>
              <div className="nav-link">
                Fon Karşılaştır
              </div>
              <div className="nav-link">
                Fon Verileri <ChevronDown size={14} />
              </div>
              <div className="nav-link">
                Risk Metrikleri
              </div>
              <div className="nav-link">
                İstatistikler <ChevronDown size={14} />
              </div>
              <div className="nav-link">
                Kurumsal <ChevronDown size={14} />
              </div>
              <div className="nav-link">
                SSS
              </div>
            </nav>

            {/* Right Area (Dark Mode, Lang, Takas Logo) */}
            <div className="header-right">
              <div className="icon-btn">
                <Moon size={16} />
              </div>

              <div className="header-divider"></div>

              <div className="lang-selector">
                <span>TR</span>
                <ChevronDown size={14} />
              </div>

              <div className="header-divider"></div>

              <div className="takas-logo">
                <img src="/assets/photos/logo-takas-dark.svg" alt="Takas İstanbul" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="tefas-main">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
