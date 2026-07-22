import React, { useState } from 'react';
import { X, Award, AlertCircle, Eye, EyeOff } from 'lucide-react';

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
