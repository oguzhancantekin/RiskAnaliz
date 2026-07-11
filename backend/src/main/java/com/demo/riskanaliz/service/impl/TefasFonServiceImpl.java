package com.demo.riskanaliz.service.impl;

import com.demo.riskanaliz.daoServices.TefasFonDao;
import com.demo.riskanaliz.service.TefasFonService;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.List;

@Service
public class TefasFonServiceImpl implements TefasFonService {

    private final TefasFonDao tefasFonDao;
    // private final SimpleDateFormat dateFormat = new
    // SimpleDateFormat("dd.MM.yyyy");

    public TefasFonServiceImpl(TefasFonDao tefasFonDao) {
        this.tefasFonDao = tefasFonDao;
    }

    // @Transactional: Eğer kaydederken hata çıkarsa veritabanını geri alır
    // (Rollback)
    // Böylece yarım yamalak veri kaydedilmesini engeller.
    @Override
    @Transactional
    public void processTefasCsv(MultipartFile file) throws Exception {
        List<Object[]> fonList = new ArrayList<>();
        List<Object[]> fiyatList = new ArrayList<>();

        // TEFAS genelde gg.aa.yyyy formatında tarih verir
        SimpleDateFormat dateFormat = new SimpleDateFormat("dd.MM.yyyy");

        // Yüklenen dosyayı utf-8 formatında okumak için açıyoruz
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {

            // TEFAS dosyasında ilk 3 satır "Dışa Aktarım Tarihi", "Toplam Kayıt Sayısı"
            // gibi gereksiz bilgilerdir.
            // Gerçek sütun başlıklarını bulana kadar (Fon Kodu, Fiyat vs.) satırları
            // atlıyoruz.
            reader.mark(2048);
            String line;
            while ((line = reader.readLine()) != null) {
                if (line.contains("Fon Kodu") && line.contains("Fiyat")) {
                    reader.reset(); // Okuyucuyu başlık satırının en başına geri sar
                    break;
                }
                reader.mark(2048); // Bulamadıysak bir sonraki satır için işareti güncelle
            }

            // İndirdiğin dosya virgülle ayrılmış, o yüzden DEFAULT (, virgül) formatını
            // kullanıyoruz.
            CSVFormat csvFormat = CSVFormat.DEFAULT.builder()
                    .setHeader() // İlk satırı başlık olarak al (Tarih, Fon Kodu vb.)
                    .setSkipHeaderRecord(true)
                    .setIgnoreEmptyLines(true)
                    .build();

            try (CSVParser parser = new CSVParser(reader, csvFormat)) {
                for (CSVRecord record : parser) {
                    try {
                        // Başlıklara göre hücre değerlerini çekiyoruz
                        String tarihStr = record.get("Tarih");
                        String fonKodu = record.get("Fon Kodu");
                        String fonAdi = record.get("Fon Adı");
                        String fiyatStr = record.get("Fiyat");

                        // Eğer fon kodu boşsa bu satırı atla
                        if (fonKodu == null || fonKodu.trim().isEmpty()) {
                            continue;
                        }

                        // Yazıyı Veritabanı Tarih Formatına Çevir
                        java.util.Date parsedDate = dateFormat.parse(tarihStr);
                        java.sql.Date sqlDate = new java.sql.Date(parsedDate.getTime());

                        // Yazıyı Virgüllü Rakama Çevir
                        Float fiyat = parseFloatSafe(fiyatStr);

                        // Listelere paketle
                        fonList.add(new Object[] { fonKodu, fonAdi });
                        fiyatList.add(new Object[] { fonKodu, sqlDate, fiyat });

                    } catch (Exception e) {
                        // Hatalı satırları logla (arka planda konsolda görünür)
                        System.err.println("Satır okunurken hata: " + e.getMessage());
                    }
                }
            }
        }

        // Eğer hiç veri okunamadıysa sessizce başarılı dönmek yerine hata fırlat!
        if (fonList.isEmpty() && fiyatList.isEmpty()) {
            throw new Exception(
                    "Dosya yüklenirken bir hata oluştu: Dosyadan HİÇ veri okunamadı! Lütfen dosyanın Sütun Başlıklarının (Tarih, Fon Kodu vb.) doğru olduğuna ve virgül (,) ile ayrıldığına emin ol. İstersen dosyayı not defteri ile açıp kontrol edebilirsin.");
        }

        // Listeler dolduktan sonra veritabanına ulaştırılmak üzere DAO'ya gönderiyoruz
        tefasFonDao.saveFonListesi(fonList);
        tefasFonDao.saveFonFiyatlari(fiyatList);
    }

    // TEFAS sayıları Türkiye formatında (Örn: 3,1365) veriyor.
    // Java ise (3.1365) Amerikan formatı anlar. Bu yüzden dönüştürüyoruz.
    private Float parseFloatSafe(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        try {
            return Float.parseFloat(value.trim().replace(".", "").replace(",", "."));
        } catch (NumberFormatException e) {
            return null;
        }
    }

    @Override
    @Transactional
    public void updateFonTuruCsv(MultipartFile file) throws Exception {
        List<Object[]> fonTuruList = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {

            // Gerçek sütun başlıklarını bulana kadar satırları atlıyoruz
            reader.mark(2048);
            String line;
            while ((line = reader.readLine()) != null) {
                if (line.contains("Fon Kodu") && line.contains("Şemsiye Fon Türü")) {
                    reader.reset();
                    break;
                }
                reader.mark(2048);
            }

            // Dosya virgülle ayrılmış
            CSVFormat csvFormat = CSVFormat.DEFAULT.builder()
                    .setHeader()
                    .setSkipHeaderRecord(true)
                    .setIgnoreEmptyLines(true)
                    .build();

            try (CSVParser parser = new CSVParser(reader, csvFormat)) {
                for (CSVRecord record : parser) {
                    try {
                        String fonKodu = record.get("Fon Kodu");
                        String fonTuru = record.get("Şemsiye Fon Türü");

                        if (fonKodu != null && !fonKodu.trim().isEmpty() && fonTuru != null
                                && !fonTuru.trim().isEmpty()) {
                            // UPDATE sorgusundaki soru işaretleri sırasına göre paketliyoruz [FON_TURU,
                            // FON_KODU]
                            fonTuruList.add(new Object[] { fonTuru, fonKodu });
                        }
                    } catch (Exception e) {
                        System.err.println("Satır okunurken hata: " + e.getMessage());
                    }
                }
            }
        }

        if (fonTuruList.isEmpty()) {
            throw new Exception(
                    "Dosyadan Fon Türü verisi okunamadı! Sütun başlıklarının (Fon Kodu, Şemsiye Fon Türü) doğru olduğuna emin olun.");
        }

        tefasFonDao.updateFonTuru(fonTuruList);
    }
}
