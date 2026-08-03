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

    public TefasFonServiceImpl(TefasFonDao tefasFonDao) {
        this.tefasFonDao = tefasFonDao;
                System.out.println(">>> 🚀 TEFAS FON servıce NESNESİ SPRING TARAFINDAN OLUŞTURULDU! <<<");

    }

    // /api/tefas/upload (Tarihsel Fiyat Verileri Yükleme)
    // Sadece günlük kapanış fiyatlarını işler ve saveFonFiyatlari (PR_SAVE_FON_FIYAT) çağırır.
    @Override
    @Transactional
    public void processTefasCsv(MultipartFile file) throws Exception {
        List<Object[]> fiyatList = new ArrayList<>();
        SimpleDateFormat dateFormat = new SimpleDateFormat("dd.MM.yyyy");

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {

            reader.mark(2048);
            String line;
            while ((line = reader.readLine()) != null) {
                if (line.contains("Fon Kodu") && line.contains("Fiyat")) {
                    reader.reset();
                    break;
                }
                reader.mark(2048);
            }

            CSVFormat csvFormat = CSVFormat.DEFAULT.builder()
                    .setHeader()
                    .setSkipHeaderRecord(true)
                    .setIgnoreEmptyLines(true)
                    .build();

            try (CSVParser parser = new CSVParser(reader, csvFormat)) {
                for (CSVRecord record : parser) {
                    try {
                        String tarihStr = record.get("Tarih");
                        String fonKodu = record.get("Fon Kodu");
                        String fiyatStr = record.get("Fiyat");

                        if (fonKodu == null || fonKodu.trim().isEmpty()) {
                            continue;
                        }

                        java.util.Date parsedDate = dateFormat.parse(tarihStr);
                        java.sql.Date sqlDate = new java.sql.Date(parsedDate.getTime());
                        Float fiyat = parseFloatSafe(fiyatStr);

                        fiyatList.add(new Object[] { fonKodu, sqlDate, fiyat });

                    } catch (Exception e) {
                        System.err.println("Satır okunurken hata: " + e.getMessage());
                    }
                }
            }
        }

        if (fiyatList.isEmpty()) {
            throw new Exception(
                    "Dosya yüklenirken bir hata oluştu: Dosyadan HİÇ fiyat verisi okunamadı! Lütfen sütun başlıklarının (Tarih, Fon Kodu, Fiyat) doğru olduğuna emin olun.");
        }

        // Sadece günlük fiyat geçmişini kaydediyoruz
        tefasFonDao.saveFonFiyatlari(fiyatList);
    }

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

    // /api/tefas/upload-info (Fon Genel Bilgileri ve Tür Yükleme)
    // Fon Kodu, Fon Adı ve Şemsiye Fon Türü bilgilerini alır ve saveFonListesi (PR_SAVE_FON) çağırır.
    @Override
    @Transactional
    public void updateFonTuruCsv(MultipartFile file) throws Exception {
        List<Object[]> fonInfoList = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {

            reader.mark(2048);
            String line;
            while ((line = reader.readLine()) != null) {
                if (line.contains("Fon Kodu") && line.contains("Şemsiye Fon Türü")) {
                    reader.reset();
                    break;
                }
                reader.mark(2048);
            }

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
                        String fonAdi = record.isMapped("Fon Adı") ? record.get("Fon Adı") : null;

                        if (fonKodu != null && !fonKodu.trim().isEmpty() && fonTuru != null
                                && !fonTuru.trim().isEmpty()) {
                            // PR_SAVE_FON prosedürüne [FON_KODU, FON_ADI, FON_TURU] olarak yolluyoruz
                            fonInfoList.add(new Object[] { fonKodu, fonAdi, fonTuru });
                        }
                    } catch (Exception e) {
                        System.err.println("Satır okunurken hata: " + e.getMessage());
                    }
                }
            }
        }

        if (fonInfoList.isEmpty()) {
            throw new Exception(
                    "Dosyadan Fon Künye/Türü verisi okunamadı! Sütun başlıklarının (Fon Kodu, Şemsiye Fon Türü) doğru olduğuna emin olun.");
        }

        tefasFonDao.saveFonListesi(fonInfoList);
    }
}
