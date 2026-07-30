import React, { useState } from 'react';
import { X, Award, AlertCircle, Eye, EyeOff, Sparkles } from 'lucide-react';

const FUND_COLORS = [
  { stroke: '#3b82f6', fill: 'rgba(59, 130, 246, 0.3)', name: 'Mavi' },
  { stroke: '#10b981', fill: 'rgba(16, 185, 129, 0.3)', name: 'Yeşil' },
  { stroke: '#f59e0b', fill: 'rgba(245, 158, 11, 0.3)', name: 'Turuncu' },
  { stroke: '#a855f7', fill: 'rgba(168, 85, 247, 0.3)', name: 'Mor' },
  { stroke: '#ec4899', fill: 'rgba(236, 72, 153, 0.3)', name: 'Pembe' }
];

const getPropNum = (item, key) => {
  if (!item) return 0;
  const val = item[key] ?? item[key.toLowerCase()] ?? item[key.toUpperCase()];
  return val === null || val === undefined ? 0 : Number(val);
};

const getPropStr = (item, key) => {
  if (!item) return '';
  return item[key] ?? item[key.toLowerCase()] ?? item[key.toUpperCase()] ?? '';
};

const FundCompareModal = ({ isOpen, onClose, selectedFunds }) => {
  const [hiddenCodes, setHiddenCodes] = useState([]);

  if (!isOpen || !selectedFunds || selectedFunds.length === 0) return null;

  const toggleFundVisibility = (code) => {
    if (hiddenCodes.includes(code)) {
      setHiddenCodes(hiddenCodes.filter(c => c !== code));
    } else {
      if (selectedFunds.length - hiddenCodes.length <= 1) return; // keep at least 1 active
      setHiddenCodes([...hiddenCodes, code]);
    }
  };

  // 1. Calculate Min/Max across selected funds for 0-100 normalization
  const calculateScores = (funds) => {
    const rawMetrics = funds.map(f => ({
      fund: f,
      sharpe: getPropNum(f, 'SHARPE'),
      sortino: getPropNum(f, 'SORTINO'),
      alpha: getPropNum(f, 'ALPHA'),
      vol: getPropNum(f, 'VOLATILITE'),
      downside: getPropNum(f, 'DOWNSIDE_RISK')
    }));

    const getMinMax = (key) => {
      const vals = rawMetrics.map(m => m[key]);
      const min = Math.min(...vals);
      const max = Math.max(...vals);
      return { min, max: min === max ? min + 1 : max };
    };

    const sRange = getMinMax('sharpe');
    const soRange = getMinMax('sortino');
    const aRange = getMinMax('alpha');
    const vRange = getMinMax('vol');
    const dRange = getMinMax('downside');

    const normalize = (val, range, invert = false) => {
      if (range.max === range.min) return 50;
      let norm = ((val - range.min) / (range.max - range.min)) * 100;
      norm = Math.max(12, Math.min(100, norm)); // keep within 12-100 for SVG chart visibility
      return invert ? 112 - norm : norm;
    };

    return rawMetrics.map(m => ({
      code: getPropStr(m.fund, 'FON_KODU'),
      name: getPropStr(m.fund, 'FON_ADI'),
      raw: m,
      scores: [
        normalize(m.sharpe, sRange, false),      // 0: Verimlilik (Sharpe)
        normalize(m.sortino, soRange, false),    // 1: Düşüş Koruması (Sortino)
        normalize(m.alpha, aRange, false),        // 2: Alfa (Piyasa Bağımsızlığı)
        normalize(m.vol, vRange, true),           // 3: Fiyat İstikrarı (Düşük Volatilite)
        normalize(m.downside, dRange, true)       // 4: Kayıp Direnci (Düşük Downside)
      ]
    }));
  };

  const fundScores = calculateScores(selectedFunds);

  // SVG Radar Dimensions
  const size = 350;
  const center = size / 2;
  const radius = 110;

  const axes = [
    { label: 'Sharpe (Verimlilik)', angle: -90 },
    { label: 'Sortino (Düşüş K.)', angle: -18 },
    { label: 'Alpha (Piyasa B.)', angle: 54 },
    { label: 'Fiyat İstikrarı', angle: 126 },
    { label: 'Kayıp Direnci', angle: 198 }
  ];

  const getCoordinates = (angleDeg, distanceRatio) => {
    const angleRad = (angleDeg * Math.PI) / 180;
    const r = radius * distanceRatio;
    return {
      x: center + r * Math.cos(angleRad),
      y: center + r * Math.sin(angleRad)
    };
  };

  const getPolygonPoints = (scores) => {
    return scores
      .map((score, i) => {
        const ratio = score / 100;
        const pt = getCoordinates(axes[i].angle, ratio);
        return `${pt.x},${pt.y}`;
      })
      .join(' ');
  };

  // Find best performing fund for each metric among VISIBLE funds
  const visibleFunds = selectedFunds.filter(f => !hiddenCodes.includes(getPropStr(f, 'FON_KODU')));
  
  const findWinner = (metricKey, isMin = false) => {
    if (visibleFunds.length <= 1) return null;
    let winner = visibleFunds[0];
    let bestVal = getPropNum(visibleFunds[0], metricKey);

    visibleFunds.forEach(f => {
      const val = getPropNum(f, metricKey);
      if (isMin ? val < bestVal : val > bestVal) {
        bestVal = val;
        winner = f;
      }
    });

    return getPropStr(winner, 'FON_KODU');
  };

  const winners = {
    sharpe: findWinner('SHARPE'),
    sortino: findWinner('SORTINO'),
    alpha: findWinner('ALPHA'),
    vol: findWinner('VOLATILITE', true),
    downside: findWinner('DOWNSIDE_RISK', true)
  };

  const formatPercentText = (val) => `%${(Math.abs(val) * 100).toFixed(2).replace('.', ',')}`;

  const generateSmartSummary = () => {
    if (visibleFunds.length === 0) return "Analiz için fon seçimi bekleniyor...";

    if (visibleFunds.length === 1) {
      const f = visibleFunds[0];
      const code = getPropStr(f, 'FON_KODU');
      const beta = getPropNum(f, 'BETA');
      const alpha = getPropNum(f, 'ALPHA');
      const varRmd = getPropNum(f, 'VAR_RMD');
      
      return (
        <span>
          <strong>{code}</strong> fonu detaylı analizi: 
          {beta > 1.15 ? ` Piyasaya göre agresif bir karaktere sahip (Beta: ${beta.toFixed(2)}). Yükselişlerde daha fazla kazandırma potansiyeli taşırken düşüşlerde risklidir.` : (beta < 0.85 ? ` Piyasaya göre defansif bir yapıda (Beta: ${beta.toFixed(2)}).` : ` Piyasa ile dengeli hareket ediyor (Beta: ${beta.toFixed(2)}).`)}
          {alpha > 0.05 && ` Fon yöneticisi aktif yönetimiyle piyasanın üzerinde ekstra değer (Alpha) yaratmayı başarmış.`}
          {varRmd < 0 && ` Tarihsel istatistiklere göre olağandışı kriz dönemlerinde tahmini maksimum kayıp riski (VaR) ${formatPercentText(varRmd)} seviyesindedir.`}
        </span>
      );
    }

    if (visibleFunds.length === 2) {
      const f1 = visibleFunds[0];
      const f2 = visibleFunds[1];
      const c1 = getPropStr(f1, 'FON_KODU');
      const c2 = getPropStr(f2, 'FON_KODU');

      const r1 = getPropNum(f1, 'YILLIK_GETIRI');
      const r2 = getPropNum(f2, 'YILLIK_GETIRI');
      const s1 = getPropNum(f1, 'SHARPE');
      const s2 = getPropNum(f2, 'SHARPE');
      const v1 = getPropNum(f1, 'VOLATILITE');
      const v2 = getPropNum(f2, 'VOLATILITE');
      const d1 = getPropNum(f1, 'DOWNSIDE_RISK');
      const d2 = getPropNum(f2, 'DOWNSIDE_RISK');

      let returnWinner = r1 > r2 ? c1 : c2;
      let safeWinner = v1 < v2 ? c1 : c2;
      let downsideWinner = d1 < d2 ? c1 : c2;

      // Close returns but different risk
      if (Math.abs(r1 - r2) < 0.1 && Math.abs(s1 - s2) > 0.5) {
        let effWinner = s1 > s2 ? c1 : c2;
        let effLoser = s1 > s2 ? c2 : c1;
        return <span>Her iki fon da benzer getiriler sunuyor. Ancak <strong>{effWinner}</strong> fonu bu getiriyi elde ederken yatırımcısını çok daha az strese sokuyor ve <strong>{effLoser}</strong> fonuna göre çok daha verimli (Yüksek Sharpe).</span>;
      }

      if (returnWinner !== downsideWinner) {
        return <span><strong>{returnWinner}</strong> fonu daha yüksek getiri potansiyeli sunarken, olası piyasa düşüşlerinde (kriz anlarında) <strong>{downsideWinner}</strong> fonu çok daha korunaklı ve sakin bir liman (Düşük Downside Risk).</span>;
      }

      return <span>Kıyaslamaya göre <strong>{returnWinner}</strong> fonu hem getiri hem de risk yönetimi açısından rakibine üstünlük sağlamış görünüyor.</span>;
    }

    if (visibleFunds.length >= 3) {
      let highestReturn = visibleFunds[0];
      let lowestVol = visibleFunds[0];
      let highestCV = visibleFunds[0]; 

      visibleFunds.forEach(f => {
        if (getPropNum(f, 'YILLIK_GETIRI') > getPropNum(highestReturn, 'YILLIK_GETIRI')) highestReturn = f;
        if (getPropNum(f, 'VOLATILITE') < getPropNum(lowestVol, 'VOLATILITE')) lowestVol = f;
        if (getPropNum(f, 'DEGISIM_KATSAYISI') > getPropNum(highestCV, 'DEGISIM_KATSAYISI')) highestCV = f;
      });

      const hc = getPropStr(highestReturn, 'FON_KODU');
      const lc = getPropStr(lowestVol, 'FON_KODU');
      const wcv = getPropStr(highestCV, 'FON_KODU');

      return (
        <span>
          Seçtiğiniz fon grubu içinde; <strong>{hc}</strong> yüksek getiri arayanlar için lokomotif görevini üstlenirken, <strong>{lc}</strong> düşük volatilitesi ile portföyün defansif emniyet sübabı konumunda. 
          {wcv !== hc && wcv !== lc && ` Dikkat: Seçtiğiniz fonlar arasında ${wcv}, aldığı riske göre yeterli getiri üretememiş (Yüksek Değişim Katsayısı) zayıf halka olarak öne çıkıyor.`}
        </span>
      );
    }
  };

  return (
    <div className="compare-modal-backdrop" onClick={onClose}>
      <div className="compare-modal-card" onClick={e => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div className="compare-modal-header">
          <div className="header-title-group">
            <Award className="header-icon" size={22} />
            <div>
              <h2>Fon Risk ve Verimlilik Radarı</h2>
              <p>Fona tıklayarak grafikteki gösterimini açıp kapatabilir, 2'li kıyaslama yapabilirsiniz.</p>
            </div>
          </div>
          <button className="compare-modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Smart Summary Box */}
        <div className="smart-summary-container">
          <Sparkles className="sparkle-icon" size={24} />
          <div className="smart-summary-content">
            <h4>Sanal Fon Danışmanı</h4>
            <p>{generateSmartSummary()}</p>
          </div>
        </div>

        {/* Modal Body: Split Layout */}
        <div className="compare-modal-body">
          
          {/* Left Column: Pure SVG Radar Chart */}
          <div className="radar-chart-container">
            <h3 className="radar-chart-title">5 Boyutlu Risk/Getiri Radarı</h3>
            
            <div className="svg-wrapper">
              <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                
                {/* Background Concentric Radar Rings */}
                {[0.2, 0.4, 0.6, 0.8, 1.0].map((level, idx) => (
                  <polygon
                    key={idx}
                    points={axes
                      .map(a => {
                        const pt = getCoordinates(a.angle, level);
                        return `${pt.x},${pt.y}`;
                      })
                      .join(' ')}
                    className="radar-grid-ring"
                  />
                ))}

                {/* Radar Axes Lines */}
                {axes.map((a, i) => {
                  const endPt = getCoordinates(a.angle, 1.0);
                  return (
                    <line
                      key={i}
                      x1={center}
                      y1={center}
                      x2={endPt.x}
                      y2={endPt.y}
                      className="radar-axis-line"
                    />
                  );
                })}

                {/* Radar Axis Labels */}
                {axes.map((a, i) => {
                  const labelPt = getCoordinates(a.angle, 1.22);
                  return (
                    <text
                      key={i}
                      x={labelPt.x}
                      y={labelPt.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="radar-axis-label"
                    >
                      {a.label}
                    </text>
                  );
                })}

                {/* Fund Radar Polygons (Render ONLY if visible) */}
                {fundScores.map((fs, idx) => {
                  if (hiddenCodes.includes(fs.code)) return null;
                  const color = FUND_COLORS[idx % FUND_COLORS.length];
                  return (
                    <g key={fs.code} className="radar-polygon-group">
                      <polygon
                        points={getPolygonPoints(fs.scores)}
                        fill={color.fill}
                        stroke={color.stroke}
                        strokeWidth="2.5"
                        className="radar-fund-polygon"
                      />
                      {fs.scores.map((score, i) => {
                        const pt = getCoordinates(axes[i].angle, score / 100);
                        return (
                          <circle
                            key={i}
                            cx={pt.x}
                            cy={pt.y}
                            r="4"
                            fill={color.stroke}
                            stroke="#ffffff"
                            strokeWidth="1.5"
                          />
                        );
                      })}
                    </g>
                  );
                })}

              </svg>
            </div>

            {/* Interactive Fund Legend (Click to Toggle Visibility) */}
            <div className="radar-legend">
              {fundScores.map((fs, idx) => {
                const color = FUND_COLORS[idx % FUND_COLORS.length];
                const isHidden = hiddenCodes.includes(fs.code);
                return (
                  <div
                    key={fs.code}
                    className={`legend-item ${isHidden ? 'disabled' : ''}`}
                    onClick={() => toggleFundVisibility(fs.code)}
                    title={isHidden ? `${fs.code} Göster` : `${fs.code} Gizle`}
                  >
                    <span
                      className="legend-dot"
                      style={{ backgroundColor: isHidden ? '#6b7280' : color.stroke }}
                    ></span>
                    <span className="legend-code">{fs.code}</span>
                    {isHidden ? <EyeOff size={11} className="toggle-eye" /> : <Eye size={11} className="toggle-eye" />}
                  </div>
                );
              })}
            </div>

          </div>

          {/* Right Column: Metric Breakdown Table */}
          <div className="compare-table-container">
            <h3 className="radar-chart-title">Metrik Bazlı Kıyaslama Tablosu</h3>

            <div className="compare-grid-wrapper">
              <table className="compare-metrics-table">
                <thead>
                  <tr>
                    <th>Metrik</th>
                    {fundScores.map((fs, idx) => {
                      const color = FUND_COLORS[idx % FUND_COLORS.length];
                      const isHidden = hiddenCodes.includes(fs.code);
                      return (
                        <th
                          key={fs.code}
                          style={{ borderBottomColor: isHidden ? 'transparent' : color.stroke }}
                          className={`clickable-header ${isHidden ? 'muted' : ''}`}
                          onClick={() => toggleFundVisibility(fs.code)}
                          title="Grafikte Aç / Kapat"
                        >
                          <span
                            className="pill-header"
                            style={{
                              borderColor: isHidden ? '#4b5563' : color.stroke,
                              color: isHidden ? '#9ca3af' : color.stroke,
                              opacity: isHidden ? 0.5 : 1
                            }}
                          >
                            {fs.code} {isHidden && ' (Gizli)'}
                          </span>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Sharpe Oranı</strong></td>
                    {fundScores.map(fs => {
                      const isHidden = hiddenCodes.includes(fs.code);
                      const isWin = !isHidden && fs.code === winners.sharpe;
                      return (
                        <td key={fs.code} className={`${isWin ? 'winner-cell' : ''} ${isHidden ? 'muted-cell' : ''}`}>
                          {fs.raw.sharpe.toFixed(4)}
                          {isWin && <span className="winner-badge">Lider 🥇</span>}
                        </td>
                      );
                    })}
                  </tr>

                  <tr>
                    <td><strong>Sortino Oranı</strong></td>
                    {fundScores.map(fs => {
                      const isHidden = hiddenCodes.includes(fs.code);
                      const isWin = !isHidden && fs.code === winners.sortino;
                      return (
                        <td key={fs.code} className={`${isWin ? 'winner-cell' : ''} ${isHidden ? 'muted-cell' : ''}`}>
                          {fs.raw.sortino.toFixed(4)}
                          {isWin && <span className="winner-badge">Lider 🥇</span>}
                        </td>
                      );
                    })}
                  </tr>

                  <tr>
                    <td><strong>Alpha</strong></td>
                    {fundScores.map(fs => {
                      const isHidden = hiddenCodes.includes(fs.code);
                      const isWin = !isHidden && fs.code === winners.alpha;
                      return (
                        <td key={fs.code} className={`${isWin ? 'winner-cell' : ''} ${isHidden ? 'muted-cell' : ''}`}>
                          {fs.raw.alpha.toFixed(4)}
                          {isWin && <span className="winner-badge">Lider 🥇</span>}
                        </td>
                      );
                    })}
                  </tr>

                  <tr>
                    <td><strong>Volatilite</strong></td>
                    {fundScores.map(fs => {
                      const isHidden = hiddenCodes.includes(fs.code);
                      const isWin = !isHidden && fs.code === winners.vol;
                      return (
                        <td key={fs.code} className={`${isWin ? 'winner-cell' : ''} ${isHidden ? 'muted-cell' : ''}`}>
                          %{(fs.raw.vol * 100).toFixed(4).replace('.', ',')}
                          {isWin && <span className="winner-badge">En Düşüş 🛡️</span>}
                        </td>
                      );
                    })}
                  </tr>

                  <tr>
                    <td><strong>Downside Risk</strong></td>
                    {fundScores.map(fs => {
                      const isHidden = hiddenCodes.includes(fs.code);
                      const isWin = !isHidden && fs.code === winners.downside;
                      return (
                        <td key={fs.code} className={`${isWin ? 'winner-cell' : ''} ${isHidden ? 'muted-cell' : ''}`}>
                          %{(fs.raw.downside * 100).toFixed(4).replace('.', ',')}
                          {isWin && <span className="winner-badge">En Dayanıklı 🛡️</span>}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="compare-info-box">
              <AlertCircle size={15} />
              <span>
                Fon rozetlerine veya tablo başlıklarına tıklayarak istediğiniz fonları grafikten gizleyebilir, 2'li birebir odak kıyaslama yapabilirsiniz.
              </span>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default FundCompareModal;
