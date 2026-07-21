import { Outlet, NavLink } from 'react-router-dom';

const Layout = () => {
  return (
    <div className="tefas-layout">
      {/* Top Navigation */}
      <header className="tefas-header">
        <div className="header-container">
          {/* Logo Area */}
          <div className="logo-area">
            <NavLink to="/" className="logo-link"> {/*tiklandiginda anasayfaya yonlendirir */}
              <img src="/assets/photos/logo-tefas-dark.svg" alt="TEFAS" className="tefas-brand-logo" style={{ height: '40px' }} />
            </NavLink>
          </div>

          {/* Navigation Links */}
          <nav className="top-nav">
            <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')} end> {/*aktif olarak sayfada mıyız kontrolü ve class ataması ternary ile kontrol ediliyor.*/}
              Ana Sayfa
            </NavLink>
          </nav>

          {/* Right Area (Lang, Takas Logo) */}
          <div className="header-right">
            <div className="takas-logo">
              <img src="/assets/photos/logo-takas-dark.svg" alt="Takas İstanbul" className="takas-brand-logo" style={{ height: '36px' }} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="tefas-main">
        <Outlet /> {/*Burada outlet sayesinde sayfalar arasında geçiş yaparken, layout (header-footer) sabit kalıyor. Sadece main içine yeni sayfalar açılıyor.*/}
      </main>
    </div>
  );
};

export default Layout;
