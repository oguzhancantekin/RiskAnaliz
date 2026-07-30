# RiskAnaliz Projesi

## Proje Hakkında
RiskAnaliz, finansal piyasalardaki yatırım fonlarının performans ve risklerini analiz etmek amacıyla geliştirilmiş kapsamlı bir veri işleme ve görüntüleme sistemidir. Temel amacı, TEFAS (Türkiye Elektronik Fon Alım Satım Platformu) üzerinden elde edilen tarihsel fon verilerini işleyerek yatırımcılara detaylı risk metrikleri sunmaktır. 

Proje, fonların piyasa koşullarına karşı nasıl tepki verdiğini ve ne kadar getiri sağladığını istatistiksel modellerle hesaplayarak şu kritik finansal metrikleri üretir:
- **Alpha:** Fonun piyasa getirisinden bağımsız olarak sağladığı ekstra getiri.
- **Beta:** Fonun piyasa hareketlerine (örneğin bir endekse) olan duyarlılığı.
- **Sharpe Oranı:** Alınan 1 birimlik riske karşılık elde edilen fazla getiri.
- **Sortino Oranı:** Sadece negatif (aşağı yönlü) riski dikkate alarak elde edilen getiri oranı.
- **Treynor Oranı:** Sistematik riske (Beta) göre düzeltilmiş getiri ölçütü.
- **Volatilite:** Getirilerin standart sapması, yani fiyat dalgalanma boyutu.
- **RMD (Riske Maruz Değer):** Belirli bir güven aralığında yaşanabilecek maksimum olası kayıp.
- **Downside Risk & Değişim Katsayısı:** Aşağı yönlü sapmalar ve getiriye kıyasla risk seviyesi.

## Dosya ve Dizin Yapısı

Proje, modüler bir yaklaşımla üç temel bileşene ayrılmıştır:

```text
RiskAnaliz/
├── dbobjects/                                # Veritabanı (SQL) Nesneleri
│   ├── tables/                               # Tablolar
│   │   └── 01_create_tables.sql              # Tüm veritabanı tablolarının oluşturulması
│   ├── scripts/                              # Veri ekleme ve güncelleme scriptleri
│   │   ├── 02_insert_is_gunu.sql
│   │   └── 03_update_fon_kategori_kurucu.sql
│   ├── indexes/                              # İndeksler (Sorgu performansı için)
│   └── procedures/                           # Saklı Yordamlar (Hesaplama mantıkları)
│       ├── PR_ALPHA_HESAPLA.sql
│       ├── PR_BETA_HESAPLA.sql
│       ├── PR_SHARPE_HESAPLA.sql
│       ├── PR_TUM_RISKLERI_HESAPLA.sql       # Tüm riskleri hesaplayan ana SP
│       └── (diğer risk SP'leri)
│
├── backend/                                  # Arka Uç (Java Spring Boot) Uygulaması
│   ├── pom.xml                               # Maven bağımlılıkları
│   └── src/main/java/com/demo/riskanaliz/    # Java Kaynak Kodları
│       ├── config/                           # Konfigürasyon sınıfları
│       ├── controller/                       # REST API Endpoint'leri
│       │   ├── RiskHesaplamaController.java  # `/v1/risk/*` istekleri
│       │   ├── TefasFonController.java       # `/api/tefas/*` istekleri
│       │   └── EndeksController.java         # `/api/endeks/*` istekleri
│       ├── daoServices/                      # Veritabanı Erişim Katmanı (DAO Interfaces)
│       │   ├── RiskDao.java, TefasFonDao.java vb.
│       │   └── impl/                         # DAO Katmanı Implementasyonları
│       ├── service/                          # İş Mantığı Katmanı (Service Interfaces)
│       │   ├── RiskService.java vb.
│       │   └── impl/                         # Service Katmanı Implementasyonları
│       ├── model/                            # Veritabanı Entity / Model sınıfları
│       └── dto/                              # Veri Transfer Nesneleri (Data Transfer Objects)
│
└── frontend/                                 # Ön Uç (React / Vite) Uygulaması
    ├── package.json                          # Bağımlılıklar (React, Vite vb.)
    ├── vite.config.js                        # Vite ayarları
    └── src/                                  # React Kaynak Kodları
        ├── components/                       # Yeniden kullanılabilir UI bileşenleri
        ├── pages/                            # Sayfalar
        ├── App.jsx                           # Ana bileşen
        └── index.css                         # Global CSS stilleri
```

### Detaylı Mimari
- **Veritabanı (`dbobjects`)**: Tüm ağır matematiksel hesaplamalar ve verilerin kalıcı olarak saklanması veritabanı tarafında, özel olarak yazılmış Saklı Yordamlar (Prosedürler) ile gerçekleştirilir. Bu yapı, binlerce satırlık veri üzerinden hızlı ve optimize hesaplama yapılmasını sağlar.
- **Arka Uç (`backend`)**: Java Spring Boot ile geliştirilmiştir. Kullanıcının Postman gibi araçlarla veya arayüz üzerinden gönderdiği TEFAS verilerini alır, ayrıştırır, veritabanına aktarır ve analiz sürecini başlatacak tetikleyicileri (endpoint'ler aracılığıyla) sağlar.
- **Ön Uç (`frontend`)**: Modern web teknolojileri olan React ve Vite kullanılarak oluşturulmuştur. Hesaplama işlemleri tamamlandıktan sonra, veritabanında biriken risk sonuçlarını API üzerinden alıp, kullanıcıya anlamlı ve görsel açıdan zengin bir arayüzle sunar.

## Kurulum ve Çalıştırma Adımları

Projenin yerel ortamda çalıştırılabilmesi için aşağıdaki adımları sırasıyla uygulamanız gerekmektedir:

### 1. Veritabanı Kurulumu
Veritabanı nesneleri `dbobjects` klasöründe yer almaktadır.
1. **Tabloların Oluşturulması**: `dbobjects/tables` dizinindeki SQL scriptleri (örneğin `01_create_tables.sql`) veritabanı yönetim aracınıza (SQL Server Management Studio, DBeaver, pgAdmin vb.) yapıştırılarak öncelikle tablolar oluşturulur.
2. **Prosedürlerin Oluşturulması**: `dbobjects/procedures` dizinindeki tüm prosedürler sırasıyla veritabanında çalıştırılarak oluşturulur (Örn: `PR_ALPHA_HESAPLA.sql`, `PR_BETA_HESAPLA.sql`, ..., `PR_TUM_RISKLERI_HESAPLA.sql`).

### 2. Veri İndirme
Risk analizi yapılabilmesi için gerçek verilere ihtiyaç vardır.
1. TEFAS web sitesine gidin.
2. **Fon Getirileri** sayfasından 1 yıllık fon verilerini CSV formatında indirin.
3. Ardından **Fon Verileri** sayfasından ilgili fonların detay verilerini (yine 1 yıllık) CSV formatında indirin.

### 3. Veritabanını Doldurma ve Risk Hesaplama
İndirilen verilerin sisteme yüklenmesi ve hesaplamaların yapılması için Postman kullanılmalıdır.
1. **Postman Üzerinden Veri Yükleme**: İndirdiğiniz CSV dosyalarını, backend projesinde bulunan ilgili veri yükleme endpoint'lerini kullanarak (Fon Verileri CSV -> `/api/tefas/upload`, Fon Getirileri CSV -> `/api/tefas/upload-info`) POST istekleri ile veritabanına aktarın.
2. **Kurucu ve Kategori Verilerinin Güncellenmesi**: Veri yükleme işlemleri bittikten sonra, `dbobjects/scripts` dizinindeki yazdığımız SQL scriptlerini (örneğin `03_update_fon_kategori_kurucu.sql`) veritabanında çalıştırdığınızda; fonlara ait "kurucu" ve "kategori" gibi detay kısımlar da dolacaktır.
3. **Risk Hesaplama İşlemi**: Veriler yüklendikten sonra, tüm riskleri hesaplamak için Postman üzerinden **Risk Hesaplama POST** isteğini (`/v1/risk/hesapla`) çalıştırın. (Tarih parametresi ile).
   > Bu istek, veritabanındaki `PR_TUM_RISKLERI_HESAPLA` saklı yordamını (Stored Procedure) tetikleyerek sistemdeki tüm analizlerin yapılmasını sağlar.
 

### 4. Projeyi Ayağa Kaldırma
Sistemi görüntülemek için arka uç ve ön uç uygulamalarının çalıştırılması gerekir.

**Backend (Java Spring Boot)**
1. Tercih ettiğiniz bir IDE (IntelliJ IDEA, Eclipse vb.) üzerinden `backend` klasörünü açın.
2. Maven bağımlılıklarının yüklenmesini bekleyin ve Spring Boot projesini çalıştırın. Uygulamanız ayağa kalkacak ve REST API'ler hizmet vermeye başlayacaktır.

**Frontend (React / Vite)**
1. Terminal üzerinden `frontend` klasörüne gidin:
   ```bash
   cd frontend
   ```
2. Gerekli paketleri yükleyin:
   ```bash
   npm install
   ```
3. Arayüzü başlatın:
   ```bash
   npm run dev
   ```
4. Terminalde belirtilen adrese (genellikle `http://localhost:5173`) tarayıcınızdan giderek RiskAnaliz arayüzüne erişebilirsiniz.
