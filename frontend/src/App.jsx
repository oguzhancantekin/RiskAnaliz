import { useState } from 'react';
import './index.css';

function App() {
  // useState: React'te değişkenleri tuttuğumuz yapılardır. 
  // Örneğin seçilen dosyaları ve ekranda göstereceğimiz mesajları burada tutuyoruz.
  const [tefasFiyatFile, setTefasFiyatFile] = useState(null);
  const [tefasInfoFile, setTefasInfoFile] = useState(null);
  const [endeksFile, setEndeksFile] = useState(null);

  // Her bölüm için ayrı mesaj durumları
  const [fiyatMessage, setFiyatMessage] = useState({ text: '', type: '' });
  const [infoMessage, setInfoMessage] = useState({ text: '', type: '' });
  const [endeksMessage, setEndeksMessage] = useState({ text: '', type: '' });

  // Ortak bir dosya yükleme fonksiyonu oluşturduk. 
  // Hangi dosyayı, hangi API adresine (endpoint) göndereceğini dışarıdan parametre alıyor.
  const uploadFile = async (file, endpoint, setMessage) => {
    // 1. Dosya seçilmiş mi diye kontrol ediyoruz
    if (!file) {
      setMessage({ text: 'Lütfen önce bir dosya seçin!', type: 'error' });
      return;
    }

    setMessage({ text: 'Yükleniyor, lütfen bekleyin...', type: 'info' });

    // 2. Dosyayı API'ye gönderebilmek için FormData isimli bir paket (zarf) oluşturuyoruz
    const formData = new FormData();
    formData.append('file', file);

    try {
      // 3. fetch komutu ile Spring Boot backend'imize POST isteği atıyoruz
      const response = await fetch(`http://localhost:8080${endpoint}`, {
        method: 'POST',
        body: formData,
      });

      // 4. Backend'den dönen cevabı JSON formatına çevirip okuyoruz
      const data = await response.json();

      if (response.ok) {
        // Eğer HTTP 200 (OK) döndüyse başarılı mesajını ekrana basıyoruz
        setMessage({ text: data.message, type: 'success' });
      } else {
        // Hata döndüyse hata mesajını ekrana basıyoruz
        setMessage({ text: data.message, type: 'error' });
      }
    } catch (error) {
      // Sunucu kapalıysa veya ağ hatası olursa bu kısım çalışır
      setMessage({ text: 'Sunucuya bağlanılamadı. Backend çalışıyor mu?', type: 'error' });
    }
  };

  return (
    <div className="container">
      <h1>TakasBank Veri Yükleme Ekranı</h1>

      {/* 1. BÖLÜM: TEFAS FİYAT YÜKLEME */}
      <div className="upload-section">
        <h2>1. TEFAS Fon Fiyatları (Günlük Getiri İçin)</h2>
        <p>Endpoint: <code>/api/tefas/upload</code></p>
        
        {/* onChange olayı: Kullanıcı dosya seçtiğinde bu fonksiyon çalışır ve dosyayı State'e kaydeder */}
        <input 
          type="file" 
          accept=".csv" 
          className="file-input" 
          onChange={(e) => setTefasFiyatFile(e.target.files[0])} 
        />
        
        {/* Butona tıklanınca uploadFile fonksiyonunu ilgili endpoint ile çağırır */}
        <button 
          className="upload-button" 
          onClick={() => uploadFile(tefasFiyatFile, '/api/tefas/upload', setFiyatMessage)}
        >
          Fiyat CSV Yükle
        </button>

        {/* Mesaj varsa ekranda göster (başarılıysa yeşil, hatalıysa kırmızı) */}
        {fiyatMessage.text && (
          <div className={`message ${fiyatMessage.type}`}>
            {fiyatMessage.text}
          </div>
        )}
      </div>

      {/* 2. BÖLÜM: TEFAS BİLGİ YÜKLEME (FON TÜRÜ) */}
      <div className="upload-section">
        <h2>2. TEFAS Fon Kimlik Bilgileri (Şemsiye Türü vb.)</h2>
        <p>Endpoint: <code>/api/tefas/upload-info</code></p>
        
        <input 
          type="file" 
          accept=".csv" 
          className="file-input" 
          onChange={(e) => setTefasInfoFile(e.target.files[0])} 
        />
        
        <button 
          className="upload-button" 
          onClick={() => uploadFile(tefasInfoFile, '/api/tefas/upload-info', setInfoMessage)}
        >
          Bilgi CSV Yükle
        </button>

        {infoMessage.text && (
          <div className={`message ${infoMessage.type}`}>
            {infoMessage.text}
          </div>
        )}
      </div>

      {/* 3. BÖLÜM: ENDEKS (BIST100) YÜKLEME */}
      <div className="upload-section">
        <h2>3. BIST100 Endeks Fiyatları (Beta İçin)</h2>
        <p>Endpoint: <code>/api/endeks/upload</code></p>
        
        <input 
          type="file" 
          accept=".csv" 
          className="file-input" 
          onChange={(e) => setEndeksFile(e.target.files[0])} 
        />
        
        <button 
          className="upload-button" 
          onClick={() => uploadFile(endeksFile, '/api/endeks/upload', setEndeksMessage)}
        >
          Endeks CSV Yükle
        </button>

        {endeksMessage.text && (
          <div className={`message ${endeksMessage.type}`}>
            {endeksMessage.text}
          </div>
        )}
      </div>

    </div>
  );
}

export default App;
