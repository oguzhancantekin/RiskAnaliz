package com.demo.riskanaliz.service.impl;

import com.demo.riskanaliz.daoServices.EndeksDao;
import com.demo.riskanaliz.service.EndeksService;
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
public class EndeksServiceImpl implements EndeksService {

    private final EndeksDao endeksDao;

    public EndeksServiceImpl(EndeksDao endeksDao) {
        this.endeksDao = endeksDao;
    }

    @Override
    @Transactional
    public void processEndeksCsv(MultipartFile file) throws Exception {
        List<Object[]> endeksList = new ArrayList<>();
        SimpleDateFormat dateFormat = new SimpleDateFormat("dd.MM.yyyy");

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {

            // Investing.com CSV'si virgül (,) ile ayrılır ve veriler çift tırnak (")
            // içindedir.
            CSVFormat csvFormat = CSVFormat.DEFAULT.builder()
                    .setHeader()
                    .setSkipHeaderRecord(true)
                    .setIgnoreEmptyLines(true)
                    .build();

            try (CSVParser parser = new CSVParser(reader, csvFormat)) {
                for (CSVRecord record : parser) {
                    try {
                        // "Tarih" ve "Şimdi" başlıklarında Türkçe karakter veya BOM (Byte Order Mark)
                        // sorunu olabileceği için isimle değil, direkt indeksle (0. ve 1. sütun)
                        // okuyoruz.
                        String tarihStr = record.get(0);
                        String fiyatStr = record.get(1);

                        if (tarihStr != null && !tarihStr.trim().isEmpty() && fiyatStr != null
                                && !fiyatStr.trim().isEmpty()) {
                            // Apache Commons CSV çift tırnakları otomatik kaldırır, doğrudan parse
                            // edebiliriz
                            java.util.Date parsedDate = dateFormat.parse(tarihStr);
                            java.sql.Date sqlDate = new java.sql.Date(parsedDate.getTime());

                            // 14.321,19 -> 14321.19
                            String cleanFiyat = fiyatStr.replace(".", "").replace(",", ".");
                            Float fiyat = Float.parseFloat(cleanFiyat);

                            // BIST100'ün veritabanındaki kodunu BIST100 olarak sabitliyoruz
                            endeksList.add(new Object[] { "BIST100", sqlDate, fiyat });
                        }
                    } catch (Exception e) {
                        System.err.println("Satır okunurken hata: " + e.getMessage());
                        e.printStackTrace();
                    }
                }
            }
        }

        if (endeksList.isEmpty()) {
            throw new Exception(
                    "Dosyadan BIST100 fiyatı okunamadı! Lütfen Investing.com tablosunda 'Tarih' ve 'Şimdi' sütunlarının bulunduğundan emin olun.");
        }

        endeksDao.saveEndeksFiyatlari(endeksList);
    }
}
