package com.demo.riskanaliz.controller;

import com.demo.riskanaliz.service.RiskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/v1/risk")
@CrossOrigin(origins = "*") // Frontend'den gelecek istekler için (React)
public class RiskHesaplamaController {

    @Autowired
    private RiskService riskService;

    @PostMapping("/hesapla")
    public ResponseEntity<Map<String, String>> hesaplamayiBaslat(
            @RequestParam("tarih") @DateTimeFormat(pattern = "yyyy-MM-dd") Date tarih) {
        
        Map<String, String> response = new HashMap<>();
        
        try {
            riskService.hesaplamayiBaslat(tarih);
            response.put("mesaj", "Seçilen tarih için risk hesaplamaları başarıyla tamamlandı!");
            response.put("durum", "BASARILI");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("mesaj", "Hesaplama sırasında hata oluştu: " + e.getMessage());
            response.put("durum", "HATALI");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @GetMapping("/sonuclar")
    public ResponseEntity<java.util.List<Map<String, Object>>> getSonuclar(
            @RequestParam(value = "fonKodu", required = false) String fonKodu) {
        
        try {
            java.util.List<Map<String, Object>> sonuclar = riskService.getSonuclar(fonKodu);
            // aynı şekilde buraki veri modeli
            return ResponseEntity.ok(sonuclar);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
