package com.demo.riskanaliz.controller;

import com.demo.riskanaliz.service.RiskService;
import com.demo.riskanaliz.dto.RiskSonucDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/v1/risk")
@CrossOrigin(origins = "*") // Frontend'den gelecek istekler için (React)
public class RiskHesaplamaController {

    @Autowired
private final RiskService riskService;

    public RiskHesaplamaController(RiskService riskService) {
        this.riskService = riskService;
        System.out.println(" >>> 🚀 RISK HESAPLAMA controller NESNESİ SPRING TARAFINDAN OLUŞTURULDU! <<<");
    }

    // Risk hesaplama işlemini başlatan REST endpoint'i
    @PostMapping("/hesapla")
    public ResponseEntity<Map<String, String>> hesaplamayiBaslat(
            // 'tarih' parametresini URL'den alır ve "yyyy-MM-dd" formatında Date nesnesine dönüştürür.
            @RequestParam("tarih") @DateTimeFormat(pattern = "yyyy-MM-dd") Date tarih) {
        
        // İşlem sonucunu (başarılı/hatalı durumu ve mesajı) frontend'e JSON olarak dönmek için bir Map oluşturulur.
        Map<String, String> response = new HashMap<>();
        
        try {
            // Servis katmanındaki hesaplamayı başlatan metodu çağırır.
            riskService.hesaplamayiBaslat(tarih);
            // Eğer işlem başarılıysa, başarı mesajı ve durum kodunu response'a ekler.
            response.put("mesaj", "Seçilen tarih için risk hesaplamaları başarıyla tamamlandı!");
            response.put("durum", "BASARILI");
            // HTTP 200 (OK) statü koduyla birlikte response nesnesini döner.
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            // Eğer hesaplama sırasında bir hata (Exception) oluşursa catch bloğuna düşer.
            // Hata mesajını response'a ekler.
            response.put("mesaj", "Hesaplama sırasında hata oluştu: " + e.getMessage());
            response.put("durum", "HATALI");
            // HTTP 500 (Internal Server Error) statü koduyla birlikte response nesnesini döner.
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @GetMapping("/sonuclar")
    public ResponseEntity<List<RiskSonucDTO>> getSonuclar(
            // Eğer parametre gönderilirse sadece o fonun, gönderilmezse (null ise) tüm fonların verisi döner.
            @RequestParam(value = "fonKodu", required = false) String fonKodu) {
        
        try {
            // Servis katmanı üzerinden veritabanındaki hesaplanmış sonuçları listeler halinde çeker.
            List<RiskSonucDTO> sonuclar1 = riskService.getSonuclar(fonKodu);
            // Veriler başarıyla çekildiyse HTTP 200 (OK) statü koduyla veriyi (JSON listesi formatında) döner.
            return ResponseEntity.ok(sonuclar1);
        } catch (Exception e) {
            // Bir hata olursa loga yazdırır ve arayüze HTTP 500 (Internal Server Error) kodu döner.
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
