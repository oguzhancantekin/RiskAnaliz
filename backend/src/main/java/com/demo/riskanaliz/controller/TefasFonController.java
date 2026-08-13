package com.demo.riskanaliz.controller;

import com.demo.riskanaliz.service.TefasFonService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/tefas")
@CrossOrigin(origins = "*")
public class TefasFonController {

    private final TefasFonService tefasFonService;

    public TefasFonController(TefasFonService tefasFonService) {
        this.tefasFonService = tefasFonService;
        System.out.println(" >>> 🚀 TEFAS FON controller NESNESİ SPRING TARAFINDAN OLUŞTURULDU! <<<");
    }

    // POST isteği ile dosya fırlatacağımız uç (endpoint)
    @PostMapping("/upload")
    public ResponseEntity<?> uploadTefasCsv(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Lütfen bir dosya seçiniz, gönderilen dosya boş!"));
        }

        try {
            // Servis katmanına dosyayı gönderiyoruz, gerisini o hallediyor
            tefasFonService.processTefasCsv(file);
            System.out.println(">>> 📊 TEFAS FON verileri başarıyla işlendi! <<<");

            // İşlem başarılıysa Frontend'e veya Postman'a 200 OK ve mesaj dönüyoruz
            return ResponseEntity.ok(Map.of("message", "Dosya başarıyla çözümlendi ve veritabanına kaydedildi."));
        } catch (Exception e) {
            e.printStackTrace(); // Logda detayı görelim
            // İşlem başarısızsa 500 dönüp hata mesajını veriyoruz
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Dosya yüklenirken bir hata oluştu: " + e.getMessage()));
        }
    }

    // YENİ: Sadece fon türlerini (kimlik bilgilerini) güncellemek için kapı
    @PostMapping("/upload-info")
    public ResponseEntity<?> uploadTefasInfoCsv(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Lütfen bir dosya seçiniz, gönderilen dosya boş!"));
        }

        try {
            tefasFonService.updateFonTuruCsv(file);
            System.out.println(">>> 📊 TEFAS FON bilgileri başarıyla güncellendi! <<<");
            return ResponseEntity
                    .ok(Map.of("message", "Tüm fonların bilgileri veritabanında başarıyla güncellendi!"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Dosya yüklenirken hata oluştu: " + e.getMessage()));
        }
    }
}
