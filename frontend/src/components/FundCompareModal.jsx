import React from 'react';
import { X, Award, AlertCircle, ExternalLink } from 'lucide-react';

const FUND_COLORS = [
  { stroke: '#3b82f6', fill: 'rgba(59, 130, 246, 0.25)', name: 'Mavi' },
  { stroke: '#10b981', fill: 'rgba(16, 185, 129, 0.25)', name: 'Yeşil' },
  { stroke: '#f59e0b', fill: 'rgba(245, 158, 11, 0.25)', name: 'Turuncu' },
  { stroke: '#a855f7', fill: 'rgba(168, 85, 247, 0.25)', name: 'Mor' },
  { stroke: '#ec4899', fill: 'rgba(236, 72, 153, 0.25)', name: 'Pembe' }
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

const FundCompareModal = ({ isOpen, onClose, selectedFunds, allData }) => {
  if (!isOpen || !selectedFunds || selectedFunds.length === 0) return null;

  // 1. Calculate Min/Max across selected funds (or all data) for 0-100 normalization
  const calculateScores = (funds) => {
    const rawMetrics = funds.map(f => ({
      fund: f,
      sharpe: getPropNum(f, 'SHARPE'),
      sortino: getPropNum(f, 'SORTINO'),
      alpha: getPropNum(f, 'ALPHA'),
      vol: getPropNum(f, 'VOLATILITE'),
      downside: getPropNum(f, 'DOWNSIDE_RISK')
    }));

    // Find min and max values to normalize
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
      norm = Math.max(10, Math.min(100, norm)); // keep within 10-100 for SVG chart visibility
      return invert ? 110 - norm : norm;
    };

    return rawMetrics.map(m => ({
      code: getPropStr(m.fund, 'FON_KODU'),
      name: getPropStr(m.fund, 'FON_ADI'),
      raw: m,
      scores: [
        normalize(m.sharpe, sRange, false),      // 0: Verimlilik (Sharpe)
        normalize(m.sortino, soRange, false),    // 1: Düşüş Koruması (Sortino)
        normalize(m.alpha, aRange, false),        // 2: Alfa (Piyasa Bağımsızlığı)
        normalize(m.vol, vRange, true),           // 3: Düşük Risk (Volatilite)
        normalize(m.downside, dRange, true)       // 4: Kayıp Direnci (Downside Risk)
      ]
    }));
  };

  const fundScores = calculateScores(selectedFunds);

  // SVG Radar Dimensions
  const size = 340;
  const center = size / 2;
  const radius = 110;
  const axisCount = 5;

  const axes = [
    { label: 'Sharpe (Verimlilik)', angle: -90 },
    { label: 'Sortino (Düşüş K.)', angle: -18 },
    { label: 'Alpha (Piyasa B.)', angle: 54 },
    { label: 'Düşük Volatilite', angle: 126 },
    { label: 'Düşük Downside', angle: 198 }
  ];

  // Convert angle and distance to SVG point
  const getCoordinates = (angleDeg, distanceRatio) => {
    const angleRad = (angleDeg * Math.PI) / 180;
    const r = radius * distanceRatio;
    return {
      x: center + r * Math.cos(angleRad),
      y: center + r * Math.sin(angleRad)
    };
  };

  // Build SVG polygon points path for a fund
  const getPolygonPoints = (scores) => {
    return scores
      .map((score, i) => {
        const ratio = score / 100;
        const pt = getCoordinates(axes[i].angle, ratio);
        return `${pt.x},${pt.y}`;
      })
      .join(' ');
  };

  // Find best performing fund for each metric
  const findWinner = (metricKey, isMin = false) => {
    if (selectedFunds.length <= 1) return null;
    let winner = selectedFunds[0];
    let bestVal = getPropNum(selectedFunds[0], metricKey);

    selectedFunds.forEach(f => {
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
              <p>Seçilen {selectedFunds.length} fonun 5 ana eksende performans ve risk kıyaslaması</p>
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

                {/* Fund Radar Polygons */}
                {fundScores.map((fs, idx) => {
                  const color = FUND_COLORS[idx % FUND_COLORS.length];
                  return (
                    <g key={fs.code}>
                      <polygon
                        points={getPolygonPoints(fs.scores)}
                        fill={color.fill}
                        stroke={color.stroke}
                        strokeWidth="2.5"
                        className="radar-fund-polygon"
                      />
                      {/* Vertex Dots */}
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

            {/* Fund Legend */}
            <div className="radar-legend">
              {fundScores.map((fs, idx) => {
                const color = FUND_COLORS[idx % FUND_COLORS.length];
                return (
                  <div key={fs.code} className="legend-item">
                    <span className="legend-dot" style={{ backgroundColor: color.stroke }}></span>
                    <span className="legend-code">{fs.code}</span>
                    <span className="legend-name">{fs.name}</span>
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
                      return (
                        <th key={fs.code} style={{ borderBottomColor: color.stroke }}>
                          <span className="pill-header" style={{ borderColor: color.stroke, color: color.stroke }}>
                            {fs.code}
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
                      const isWin = fs.code === winners.sharpe;
                      return (
                        <td key={fs.code} className={isWin ? 'winner-cell' : ''}>
                          {fs.raw.sharpe.toFixed(4)}
                          {isWin && <span className="winner-badge">Lider 🥇</span>}
                        </td>
                      );
                    })}
                  </tr>

                  <tr>
                    <td><strong>Sortino Oranı</strong></td>
                    {fundScores.map(fs => {
                      const isWin = fs.code === winners.sortino;
                      return (
                        <td key={fs.code} className={isWin ? 'winner-cell' : ''}>
                          {fs.raw.sortino.toFixed(4)}
                          {isWin && <span className="winner-badge">Lider 🥇</span>}
                        </td>
                      );
                    })}
                  </tr>

                  <tr>
                    <td><strong>Alpha</strong></td>
                    {fundScores.map(fs => {
                      const isWin = fs.code === winners.alpha;
                      return (
                        <td key={fs.code} className={isWin ? 'winner-cell' : ''}>
                          {fs.raw.alpha.toFixed(4)}
                          {isWin && <span className="winner-badge">Lider 🥇</span>}
                        </td>
                      );
                    })}
                  </tr>

                  <tr>
                    <td><strong>Volatilite</strong></td>
                    {fundScores.map(fs => {
                      const isWin = fs.code === winners.vol;
                      return (
                        <td key={fs.code} className={isWin ? 'winner-cell' : ''}>
                          %{(fs.raw.vol * 100).toFixed(4).replace('.', ',')}
                          {isWin && <span className="winner-badge">En Düşük 🛡️</span>}
                        </td>
                      );
                    })}
                  </tr>

                  <tr>
                    <td><strong>Downside Risk</strong></td>
                    {fundScores.map(fs => {
                      const isWin = fs.code === winners.downside;
                      return (
                        <td key={fs.code} className={isWin ? 'winner-cell' : ''}>
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
                Radar grafiğinde alanı en geniş olan poligon, risk ve verimlilik dengesinde öne çıkan fonu temsil eder.
              </span>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default FundCompareModal;
