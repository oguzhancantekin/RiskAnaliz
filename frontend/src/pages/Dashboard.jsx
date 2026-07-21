import { ArrowRight } from 'lucide-react';

const Dashboard = () => {

  return (
    <div className="tefas-home">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Tüm Fon Detaylarını
            <br />
            <span className="text-highlight">Tek Bir Platformda</span>
            <br />
            Keşfedin.
          </h1>
          <p className="hero-subtitle">
            TEFAS Fon Bilgilendirme Platformu; yatırımcılara fonlar hakkında bilgi edinme,
            karşılaştırma ve <span className="text-highlight">detaylı risk analizi</span> yapma imkanı sağlamaktadır. Gerçek zamanlı
            metrikler ile portföyünüzü güçlendirin.
          </p>
          <button className="hero-btn">
            <span>Risk Hesaplamaya Başla</span>
            <span className="btn-icon">
              <ArrowRight size={20} />
            </span>
          </button>
        </div>
      </section>


      <marquee scrollamount="5">
        Tüm risk hesaplamaları BIST100 referans alınarak günlük güncellenmektedir. 11 farklı risk metriği ile fonları detaylı analiz edin.
      </marquee>
    </div>

  );
};

export default Dashboard;
