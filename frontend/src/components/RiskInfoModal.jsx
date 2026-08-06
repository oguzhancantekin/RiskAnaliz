import React from 'react';
import { X, ExternalLink } from 'lucide-react';
import './RiskInfoModal.css';

const RiskInfoModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="risk-info-modal-overlay">
      <div className="risk-info-modal-content">
        <div className="risk-info-modal-header">
          <div className="header-left">
            <h2>Risk Analizleri</h2>
          </div>
          <div className="header-right">
            <button className="close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>
        
        <div className="risk-info-modal-body">
          <p style={{ marginBottom: '24px', fontSize: '1.05rem', color: 'var(--text-light)' }}>
            Fon analiz platformumuza hoş geldiniz. Yatırımlarınızı daha sağlıklı değerlendirebilmeniz ve fonlar arası doğru kıyaslamayı yapabilmeniz için sistemimizde yer alan risk metriklerinin anlamlarını aşağıda bulabilirsiniz:
          </p>

          <p>
            <strong>Yıllık Getiri:</strong> İlgili fonun son bir yıl (365 gün) içerisinde yatırımcısına sağladığı brüt getiri oranını ifade eder. Piyasaların genel eğilimiyle kıyaslanarak fonun genel performansı hakkında fikir verir.
          </p>
          
          <p>
            <strong>Volatilite:</strong> Fonun getirisindeki dalgalanmaları ve standart sapmayı ölçer. Yüksek volatilite, fonun fiyatında sert iniş ve çıkışlar yaşanabileceğini, dolayısıyla taşıdığı riskin daha yüksek olduğunu gösterir.
          </p>

          <p>
            <strong>Downside Risk:</strong> Fonun yalnızca negatif getirilerinin (düşüşlerin) yarattığı riski ölçer. Piyasaların dalgalı olduğu olumsuz senaryolarda karşılaşabileceğiniz kayıp potansiyelini ifade eder. Düşük olması tercih edilir.
          </p>

          <p>
            <strong>Beta:</strong> Fon getirisinin, seçilen karşılaştırma ölçütü (benchmark) ile olan ilişkisini ve duyarlılığını gösterir. Örneğin; Beta'sı 1.2 olan bir fon, piyasadaki %1'lik bir yükselişte %1.2 artma, düşüşte ise %1.2 düşme eğilimindedir. Piyasaların yükseleceği öngörülüyorsa yüksek Beta'lı fonlar avantajlı olabilir.
          </p>

          <p>
            <strong>Sharpe Oranı:</strong> Aldığınız her 1 birimlik riske (volatiliteye) karşılık fonun ne kadar ekstra getiri sağladığını gösterir. Fonlar arasında kıyaslama yaparken, Sharpe oranının yüksek olması, fonun risk-getiri dengesini daha başarılı kurduğunu gösterir.
          </p>

          <p>
            <strong>Sortino Oranı:</strong> Sharpe oranına benzer olmakla birlikte, riski hesaplarken sadece negatif getirileri (downside risk) hesaba katar. Sadece zarar etme potansiyelinize karşılık ne kadar fazla getiri elde ettiğinizi gösterdiği için, Sortino oranı yüksek fonlar tercih edilmelidir.
          </p>

          <p>
            <strong>Treynor Oranı:</strong> Fonun elde ettiği fazla getiriyi, taşıdığı sistematik piyasa riskine (Beta'ya) oranlar. Özellikle iyi çeşitlendirilmiş portföylerde, fon yöneticisinin aldığı piyasa riskine değecek bir katma değer yaratıp yaratmadığını görmek için Treynor oranı yüksek olan fonlar tercih edilir.
          </p>

          <p>
            <strong>Alpha:</strong> Fon yöneticisinin yeteneğini ölçen en temel metriklerden biridir. Fonun, aldığı piyasa riskine göre (Beta) beklenenden ne kadar daha fazla (veya az) getiri sağladığını gösterir. Alpha'nın pozitif ve yüksek olması, yöneticinin piyasaya kıyasla artı değer yarattığını belirtir.
          </p>

          <p>
            <strong>Haftalık VaR (%99):</strong> Riske Maruz Değer (Value at Risk) metriğimiz, seçili fonu 1 hafta boyunca elinizde tuttuğunuzda %99 ihtimalle karşılaşabileceğiniz maksimum kayıp oranını belirtir. Kendi risk toleransınızı belirlerken bu değerin beklediğiniz sınırlarda olmasına dikkat etmelisiniz.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RiskInfoModal;
