import { ArrowUpRight, Megaphone, Minus } from 'lucide-react';

const Dashboard = () => {

  return (
    <div className="tefas-home">
      {/* Hero Section */}
      <section className="hero-section">
        
        <div className="hero-content">
          <h1 className="hero-title">
            Tüm <span className="text-highlight">fon detaylarını</span>
            <br />
            tek bir platformda
            <br />
            keşfedin.
          </h1>
          <p className="hero-subtitle">
            TEFAS Fon Bilgilendirme Platformu, yatırımcılara fonlar hakkında bilgi edinme, karşılaştırma ve analiz yapma imkanı sağlamaktadır. Fon alım-satım işlemleri için yatırım hesabınızın olduğu kuruma başvurabilirsiniz.
          </p>
          <button className="hero-btn">
            <span>Tüm Fonları Keşfet</span>
            <span className="btn-icon">
              <ArrowUpRight size={18} />
            </span>
          </button>
        </div>
      </section>

      {/* Footer Area within Hero */}
      <div className="home-footer-area">
        {/* Partner Logos */}
        <div className="partner-logos">
          <img src="/assets/photos/biga-logo.png" alt="BİGA Projesi" />
          <img src="/assets/photos/bes-portal-logo.png" alt="Bireysel Emeklilik" />
          <img src="/assets/photos/tasit-takas.svg" alt="TaşıtTakas" />
          <img src="/assets/photos/tapu-takas.svg" alt="TapuTakas" />
        </div>

        {/* News Ticker */}
        <div className="news-ticker-wrapper">
          <div className="ticker-label">
            <Megaphone size={16} />
            Kurucudan Duyurular
          </div>
          <div className="ticker-content">
            <marquee scrollamount="4">
              <div className="ticker-item">
                Tasfiye & Dönüşüm & Birleşme & Kurucu Değişiklikleri <Minus /> F PORTFÖY YÖNETİMİ A.Ş.
              </div>
              <div className="ticker-item">
                <Megaphone /> OTJ FON DÖNÜŞÜMÜ (OYAK PORTFÖY YÖNETİMİ A.Ş.)
              </div>
              <div className="ticker-item">
                <Megaphone /> TPC FON DÖNÜŞÜMÜ (TEB PORTFÖY YÖNETİMİ A.Ş.)
              </div>
              <div className="ticker-item">
                <Megaphone /> GJD Fon Dönüşümü (GARANTİ PORTFÖY YÖNETİMİ A.Ş.)
              </div>
            </marquee>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
