import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  ChevronRight,
  Search,
  Plus,
  Info,
  ArrowUpDown,
  RefreshCw,
  AlertCircle,
  ArrowRight,
  Copy,
  Printer,
  FileSpreadsheet,
  FileText,
  FileDown,
  SlidersHorizontal,
  X
} from 'lucide-react';

const EXCLUDED_FUNDS = ['NMG', 'OSF', 'HUS', 'PDR', 'ZJR', 'UZY'];

// Helper for case-insensitive DB property access
const getProp = (item, key) => {
  if (!item) return '';
  return item[key] ?? item[key.toLowerCase()] ?? item[key.toUpperCase()] ?? '';
}; // ?? operatoru, bir değerin null veya undefined olup olmadığını kontrol etmek için kullanılır. 
// Eğer değer null veya undefined ise, ?? operatoründen sonraki değer kullanılır. FON_ADI, fon_adi gibi

const getPropNum = (item, key) => { // item[key] o fonfan elde edilen değer,bilgilerdir.
  if (!item) return 0;
  const val = item[key] ?? item[key.toLowerCase()] ?? item[key.toUpperCase()];
  return val === null || val === undefined ? 0 : Number(val);
  // burada not a number hatası almamak için undefined değer olsa bile 0 olarak döndürürüz.
};

// Auto calculate TEFAS Risk Level (1-7) from Volatility
const getRiskValue = (volatility) => {
  if (volatility === null || volatility === undefined) return { level: 1, text: '1 / 7', color: '#10b981', percent: 14 };
  const vol = Math.abs(volatility * 100);
  if (vol < 1.0) return { level: 1, text: '1 / 7', color: '#10b981', percent: 14 };
  if (vol < 3.0) return { level: 2, text: '2 / 7', color: '#10b981', percent: 28 };
  if (vol < 7.0) return { level: 3, text: '3 / 7', color: '#fbbf24', percent: 42 };
  if (vol < 12.0) return { level: 4, text: '4 / 7', color: '#f59e0b', percent: 57 };
  if (vol < 18.0) return { level: 5, text: '5 / 7', color: '#f97316', percent: 71 };
  if (vol < 25.0) return { level: 6, text: '6 / 7', color: '#ef4444', percent: 85 };
  return { level: 7, text: '7 / 7', color: '#dc2626', percent: 100 };
};

const formatNumber = (num, decimals = 4) => { // virgülden sonra 4 basamak göstermeye yarar
  if (num === null || num === undefined || isNaN(num)) return '-'; //isNaN(num) sayı değilse demek
  return Number(num).toFixed(decimals); // decimals az önce 4 vermiştik yani 4 basamak gösteren kısım burası 
};

// Risk metriklerini (% Volatilite, % Downside Risk, % VaR) standart ve renksiz (nötr) % formatında gösterir
const formatPercent = (num, decimals = 4, isAlreadyPercent = false) => {
  if (num === null || num === undefined || isNaN(num)) return '-';
  const val = isAlreadyPercent ? Number(num) : Number(num) * 100;
  return `%${val.toFixed(decimals).replace('.', ',')}`;
};

// Yıllık Getiri için yeşil/kırmızı renkli ve oklu gösterici (Veritabanında % cinsinden tutuluyor)
const formatReturn = (num, decimals = 4, isAlreadyPercent = true) => {
  if (num === null || num === undefined || isNaN(num)) return '-';
  const val = isAlreadyPercent ? Number(num) : Number(num) * 100;
  const isPositive = val >= 0;
  return (
    <span className={`percent-val ${isPositive ? 'positive' : 'negative'}`}>
      {isPositive ? <span className="arrow-up">▲</span> : <span className="arrow-down">▼</span>}
      %{val.toFixed(decimals).replace('.', ',')}
    </span>
  );
};

const RiskMetrics = () => {
  const [data, setData] = useState([]); // risk verilerini tutan state
  const [loading, setLoading] = useState(true); // veri yükleniyor state'i

  // Controls
  const [searchTerm, setSearchTerm] = useState(''); //arama kutusu içeriği
  const [pageSize, setPageSize] = useState(25); //sayfa başına gösterilecek veri sayısı
  const [currentPage, setCurrentPage] = useState(1); //aktif sayfa numarası
  const [sortField, setSortField] = useState('FON_KODU'); //sıralama yapılacak alan
  const [sortAsc, setSortAsc] = useState(true); //artan sıralama (true) azalan (false)

  // Filters
  const [semsiyeTuru, setSemsiyeTuru] = useState('ALL'); //şemsiye türü filtresi
  const [ratioFilters, setRatioFilters] = useState([]); //oran filtreleri

  // Reset page to 1 when filters or page size change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, semsiyeTuru, ratioFilters, pageSize]);
  // [] içindeki değerlerden herhangi biri değiştiğinde useEffect çalışır ve sayfa numarası 1 e çekilir.


  const fetchRiskData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/v1/risk/sonuclar?_t=${Date.now()}`);
      if (!response.ok) throw new Error('Sunucu hatası');
      const result = await response.json();
      setData(result || []); // result null veya undefined ise [] seç, normalse result seç.
    } catch (err) {
      console.error('Backend ulaşılamadı:', err.message);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiskData();
  }, []);

  const handleHeaderSort = (field) => {
    if (sortField === field) { // eğer sortfield da tutulan değer ile field değeriyle aynıysa demek
      setSortAsc(!sortAsc); // sortasc nin tersine doğru sırala. Sortasc bool.
    } else {
      setSortField(field);
      setSortAsc(false); // sortasc false yani azalan sıralama
    }
  };

  // Ratio Filter Handlers
  const addRatioFilter = () => {
    setRatioFilters([...ratioFilters, { metric: 'SHARPE', op: '>=', val: '' }]);
  };//(...) spread operatörü, mevcut ratioFilters dizisindeki elemanları alır ve üzerine yeni bir eleman ekler.

  const removeRatioFilter = (index) => {
    setRatioFilters(ratioFilters.filter((_, i) => i !== index));
  }; // ratiofilters dizisini gezer, indexi eşit olmayanları tutar set eder. Yani x e bastığımız indekslerdeki filtreler silinir.


  const updateRatioFilter = (index, field, value) => {
    const updated = [...ratioFilters]; // ratioFilters dizisini kopyalar
    updated[index][field] = value; // güncellenecek olan indexteki field değerini value ile değiştirir.
    setRatioFilters(updated); // güncel diziyi setRatioFilters state ine set eder.
  };

  // Advanced Filtering Logic
  const filteredData = data.filter((item) => {
    const rawCode = getProp(item, 'FON_KODU');
    if (rawCode && EXCLUDED_FUNDS.includes(rawCode.toUpperCase())) return false; // FON_KODU EXCLUDED_FUNDS içindeyse filtrele. ALMA.

    // 1. Search term
    const code = (rawCode || '').toLowerCase();
    const name = getProp(item, 'FON_ADI').toLowerCase();
    const search = searchTerm.toLowerCase();
    if (search && !(code.includes(search) || name.includes(search))) return false; // searchTerm de FON_ADI veya FON_KODU içinde arama kelimesi yoksa filtrele.

    // 2. Umbrella Type
    const semsiye = getProp(item, 'SEMSIYE');
    if (semsiyeTuru !== 'ALL' && semsiye !== semsiyeTuru) return false; // SEMSIYE, semsiyeTuru ile aynı değilse filtrele.

    // 3. Dynamic Ratio Filters
    for (let f of ratioFilters) {
      if (!f.val || f.val.trim() === '') continue;
      const numVal = parseFloat(f.val);
      if (isNaN(numVal)) continue;

      const itemVal = getPropNum(item, f.metric);
      if (f.op === '>=' && !(itemVal >= numVal)) return false;
      if (f.op === '<=' && !(itemVal <= numVal)) return false;
      if (f.op === '>' && !(itemVal > numVal)) return false;
      if (f.op === '<' && !(itemVal < numVal)) return false;
      if (f.op === '=' && !(itemVal === numVal)) return false;
    }

    return true;
  });

  // Sorting Logic
  const sortedData = [...filteredData].sort((a, b) => {
    let valA = getProp(a, sortField);
    let valB = getProp(b, sortField);

    let numA = getPropNum(a, sortField);
    let numB = getPropNum(b, sortField);

    if (typeof valA === 'string' && isNaN(Number(valA))) {
      return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }               // A dan Z ye sıralama      // Z den A ya sıralama
    return sortAsc ? numA - numB : numB - numA; // sortasc true ise küçükten büyüğe, false ise büyükten küçüğe sırala
  });

  // Pagination Logic (SAYFALAMA)
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1; // ceil sayıyı yukarı yuvarlar, fon sayısı/sayfa başına düşen fon sayısı ile toplam sayfa sayısını bulur.
  const startIndex = (currentPage - 1) * pageSize; //sayfada görüntülenen başlangıç indexi
  const displayedData = sortedData.slice(startIndex, startIndex + pageSize); //görüntülenecek veriler

  return (
    <div className="tefas-page">
      <div className="tefas-page-container">

        {/* Breadcrumb Bar */}
        <div className="tefas-breadcrumb">
          <NavLink to="/">Ana Sayfa</NavLink>
          <ChevronRight size={12} className="breadcrumb-arrow" />
          <span className="current">Risk Metrikleri</span>
        </div>

        {/* Title Bar & Export Toolbar */}
        <div className="tefas-title-bar">
          <div className="title-left">
            <h1 className="tefas-section-title">Fon Risk Metrikleri Hesaplama</h1>
            <p className="tefas-section-desc">
              Fon adına veya koduna tıklayarak TEFAS detaylı analiz sayfasına erişebilirsiniz.
            </p>

            {/* Export Toolbar Buttons */}
            <div className="export-toolbar">
              <button className="export-btn"><Copy size={13} /> Kopyala</button>
              <button className="export-btn"><Printer size={13} /> Yazdır</button>
              <button className="export-btn"><FileSpreadsheet size={13} /> Excel</button>
              <button className="export-btn"><FileText size={13} /> CSV</button>
              <button className="export-btn"><FileDown size={13} /> PDF</button>
            </div>
          </div>

          {/* Top Search Input */}
          <div className="title-right">
            <div className="tefas-search-box">
              <input
                type="text"
                placeholder="Aradığınız fonun kodunu veya adını yazınız"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search size={16} className="search-icon" />
            </div>
            <div className="search-meta-info">
              <span>{sortedData.length} sonuç bulundu</span>
            </div>
          </div>
        </div>

        {/* Dynamic Ratio Filter Card*/}
        <div className="dynamic-filter-card">
          <div className="filter-card-body">

            {/* Umbrella Select Left */}
            <div className="filter-col-semsiye">
              <label>Şemsiye Fon Türü</label>
              <select
                value={semsiyeTuru}
                onChange={(e) => setSemsiyeTuru(e.target.value)}
                className="tefas-select-lg"
              >
                <option value="ALL">Tümü</option>
                <option value="Serbest Şemsiye Fonu">Serbest Şemsiye Fonu</option>
                <option value="Para Piyasası Şemsiye Fonu">Para Piyasası Şemsiye Fonu</option>
                <option value="Katılım Şemsiye Fonu">Katılım Şemsiye Fonu</option>
                <option value="Borçlanma Araçları Şemsiye Fonu">Borçlanma Araçları Şemsiye Fonu</option>
                <option value="Hisse Senedi Şemsiye Fonu">Hisse Senedi Şemsiye Fonu</option>
              </select>
            </div>

            {/* Dynamic Ratio Controls Right */}
            <div className="filter-col-ratios">
              <label>Oran Filtreleme</label>
              <div className="ratio-inputs-list">
                {ratioFilters.map((rf, idx) => (
                  <div key={idx} className="ratio-input-group">
                    <select
                      value={rf.metric}
                      onChange={(e) => updateRatioFilter(idx, 'metric', e.target.value)}
                      className="ratio-select-metric"
                    >
                      <option value="SHARPE">Sharpe</option>
                      <option value="YILLIK_GETIRI">Yıllık Getiri (%)</option>
                      <option value="VOLATILITE">Volatilite</option>
                      <option value="DOWNSIDE_RISK">Downside Risk</option>
                      <option value="BETA">Beta</option>
                      <option value="ALPHA">Alpha</option>
                      <option value="SORTINO">Sortino</option>
                      <option value="TREYNOR">Treynor</option>
                      <option value="VAR_RMD">Haftalık VaR (%99)</option>
                    </select>

                    <select
                      value={rf.op}
                      onChange={(e) => updateRatioFilter(idx, 'op', e.target.value)}
                      className="ratio-select-op"
                    >
                      <option value=">=">&gt;=</option>
                      <option value="<=">&lt;=</option>
                      <option value=">">&gt;</option>
                      <option value="<">&lt;</option>
                      <option value="=">=</option>
                    </select>

                    <input
                      type="text"
                      placeholder="0.0"
                      value={rf.val}
                      onChange={(e) => updateRatioFilter(idx, 'val', e.target.value)}
                      className="ratio-val-input"
                    />

                    <button
                      onClick={() => removeRatioFilter(idx)}
                      className="remove-ratio-btn"
                      title="Filtreyi Kaldır"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Ratio Filter Action Buttons */}
              <div className="ratio-actions-row">
                <button onClick={addRatioFilter} className="add-ratio-link-btn">
                  + Oran Filtreleme
                </button>
                {ratioFilters.length > 0 && (
                  <button onClick={() => setRatioFilters([])} className="clear-ratios-link-btn">
                    Tüm Filtreleri Temizle
                  </button>
                )}
              </div>
            </div>

            {/* Listele Submit Button Right */}
            <div className="filter-col-submit">
              <button onClick={fetchRiskData} className="tefas-submit-btn-lg">
                <span>Listele</span>
                <ArrowRight size={16} />
              </button>
            </div>

          </div>
        </div>

        {/* Sub-table Control Bar */}
        <div className="table-sub-controls">
          <div className="sub-controls-left"></div>
          <div className="sub-controls-right">
            <span className="sub-results-count">{sortedData.length} sonuç bulundu</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="tefas-page-size-select"
            >
              <option value={10}>10 Öğe Göster</option>
              <option value={25}>25 Öğe Göster</option>
              <option value={50}>50 Öğe Göster</option>
              <option value={100}>100 Öğe Göster</option>
            </select>
            <button className="tefas-list-settings-btn">
              <span>Listeleme Ayarları</span>
              <SlidersHorizontal size={14} />
            </button>
          </div>
        </div>

        {/* TEFAS Custom Data Table */}
        <div className="tefas-table-card">
          {loading ? (
            <div className="tefas-table-loading">
              <RefreshCw className="spin" size={28} />
              <span>Veriler yükleniyor...</span>
            </div>
          ) : (
            <div className="table-scroll-container">
              <table className="tefas-blue-header-table">
                <thead>
                  <tr>
                    <th className="th-action"></th>
                    <th onClick={() => handleHeaderSort('FON_KODU')} className="sortable th-code">
                      Fon Kodu <ArrowUpDown size={11} />
                    </th>
                    <th onClick={() => handleHeaderSort('FON_ADI')} className="sortable th-name">
                      Fon Adı <ArrowUpDown size={11} />
                    </th>
                    <th onClick={() => handleHeaderSort('SEMSIYE')} className="sortable th-semsiye">
                      Şemsiye Fon Türü <ArrowUpDown size={11} />
                    </th>
                    <th onClick={() => handleHeaderSort('VOLATILITE')} className="sortable text-center th-risk">
                      Risk Skoru <Info size={12} className="info-icon" /> <ArrowUpDown size={11} />
                    </th>
                    <th onClick={() => handleHeaderSort('YILLIK_GETIRI')} className="sortable text-right th-num">
                      Yıllık Getiri <ArrowUpDown size={11} />
                    </th>
                    <th onClick={() => handleHeaderSort('VOLATILITE')} className="sortable text-right th-num">
                      Volatilite <ArrowUpDown size={11} />
                    </th>
                    <th onClick={() => handleHeaderSort('DOWNSIDE_RISK')} className="sortable text-right th-num">
                      Downside Risk <ArrowUpDown size={11} />
                    </th>
                    <th onClick={() => handleHeaderSort('BETA')} className="sortable text-right th-num">
                      Beta <ArrowUpDown size={11} />
                    </th>
                    <th onClick={() => handleHeaderSort('SHARPE')} className="sortable text-right th-num">
                      Sharpe <ArrowUpDown size={11} />
                    </th>
                    <th onClick={() => handleHeaderSort('SORTINO')} className="sortable text-right th-num">
                      Sortino <ArrowUpDown size={11} />
                    </th>
                    <th onClick={() => handleHeaderSort('TREYNOR')} className="sortable text-right th-num">
                      Treynor <ArrowUpDown size={11} />
                    </th>
                    <th onClick={() => handleHeaderSort('ALPHA')} className="sortable text-right th-num">
                      Alpha <ArrowUpDown size={11} />
                    </th>
                    <th onClick={() => handleHeaderSort('VAR_RMD')} className="sortable text-right th-num th-var" title="1 haftada %99 ihtimalle maruz kalınabilecek maksimum kayıp oranı">
                      Haftalık VaR (%99) <Info size={11} className="info-icon" /> <ArrowUpDown size={11} />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {displayedData.length > 0 ? (
                    displayedData.map((item, index) => { /* buradaki map sayesinde item her seferinde yeni değer alır 1 AAL 2 ABC gibi */
                      const fonKodu = getProp(item, 'FON_KODU');
                      const fonAdi = getProp(item, 'FON_ADI');
                      const semsiye = getProp(item, 'SEMSIYE') || 'Yatırım Fonu';
                      const yillikGetiri = getPropNum(item, 'YILLIK_GETIRI');
                      const volatilite = getPropNum(item, 'VOLATILITE');
                      const downsideRisk = getPropNum(item, 'DOWNSIDE_RISK');
                      const beta = getPropNum(item, 'BETA');
                      const sharpe = getPropNum(item, 'SHARPE');
                      const sortino = getPropNum(item, 'SORTINO');
                      const treynor = getPropNum(item, 'TREYNOR');
                      const alpha = getPropNum(item, 'ALPHA');
                      const varRmd = getPropNum(item, 'VAR_RMD');

                      const riskInfo = getRiskValue(volatilite);

                      return (
                        <tr key={index}>
                          <td className="td-action">
                            <button className="add-btn" title="Karşılaştırmaya Ekle">
                              <Plus size={12} />
                            </button>
                          </td>
                          <td className="td-code">
                            <a
                              href={`https://www.tefas.gov.tr/tr/fon-detayli-analiz/${fonKodu}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="code-pill-link"
                              title={`${fonKodu} TEFAS Detaylı Analiz Sayfasını Aç`}
                            >
                              <span className="code-pill">{fonKodu}</span>
                            </a>
                          </td>
                          <td className="td-name" title={fonAdi}>
                            <a
                              href={`https://www.tefas.gov.tr/tr/fon-detayli-analiz/${fonKodu}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="fund-name-link"
                            >
                              {fonAdi || '-'}
                            </a>
                          </td>
                          <td className="td-semsiye" title={semsiye}>
                            <span>{semsiye}</span>
                          </td>
                          <td className="td-risk text-center">
                            <div className="risk-display">
                              <span className="risk-score" style={{ color: riskInfo.color }}>{riskInfo.text}</span>
                              <div className="risk-bar-track">
                                <div
                                  className="risk-bar-fill"
                                  style={{
                                    width: `${riskInfo.percent}%`,
                                    backgroundColor: riskInfo.color
                                  }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="text-right">{formatReturn(yillikGetiri, 4, true)}</td>
                          <td className="text-right">{formatPercent(volatilite, 4)}</td>
                          <td className="text-right">{formatPercent(downsideRisk, 4)}</td>
                          <td className="text-right">{formatNumber(beta, 4)}</td>
                          <td className="text-right">{formatNumber(sharpe, 4)}</td>
                          <td className="text-right">{formatNumber(sortino, 4)}</td>
                          <td className="text-right">{formatNumber(treynor, 4)}</td>
                          <td className="text-right">{formatNumber(alpha, 4)}</td>
                          <td className="text-right">{formatPercent(varRmd, 4, true)}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="14" className="tefas-no-data">
                        <AlertCircle size={20} />
                        <span>Arama kriterlerine uygun fon bulunamadı.</span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* TEFAS Replica Pagination Control Bar */}
        <div className="tefas-pagination-bar">
          <div className="pagination-info">
            {sortedData.length > 0 ? (
              <span>
                Toplam <strong>{sortedData.length}</strong> kayıttan <strong>{startIndex + 1}</strong> - <strong>{Math.min(startIndex + pageSize, sortedData.length)}</strong> arası gösteriliyor
              </span>
            ) : (
              <span>Kayıt bulunamadı</span>
            )}
          </div>
          <div className="pagination-controls">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className="page-nav-btn"
            >
              &lt; Önceki
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
              .map((p, i, arr) => {
                const showEllipsis = i > 0 && p - arr[i - 1] > 1;
                return (
                  <React.Fragment key={p}>
                    {showEllipsis && <span className="page-ellipsis">...</span>}
                    <button
                      className={`page-num-btn ${currentPage === p ? 'active' : ''}`}
                      onClick={() => setCurrentPage(p)}
                    >
                      {p}
                    </button>
                  </React.Fragment>
                );
              })}

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              className="page-nav-btn"
            >
              Sonraki &gt;
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RiskMetrics;
