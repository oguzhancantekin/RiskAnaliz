package com.demo.riskanaliz.controller;

import com.demo.riskanaliz.service.EndeksService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/endeks")
@CrossOrigin(origins = "*")
public class EndeksController {

    private final EndeksService endeksService;

    public EndeksController(EndeksService endeksService) {
        this.endeksService = endeksService;
        System.out.println(" >>> 🚀 ENDEKS controller NESNESİ SPRING TARAFINDAN OLUŞTURULDU! <<<");
    }

    // POST isteği ile dosya fırlatacağımız uç (endpoint)
    @PostMapping("/upload")
    public ResponseEntity<?> uploadEndeksCsv(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Lütfen bir dosya seçiniz, gönderilen dosya boş!"));
        }

        try {
            // Servis katmanına dosyayı gönderiyoruz. Gerisi o tarafta.
            endeksService.processEndeksCsv(file);
            return ResponseEntity
                    .ok(Map.of("message", "BIST100 verileri başarıyla çözümlendi ve veritabanına kaydedildi."));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Dosya yüklenirken bir hata oluştu: " + e.getMessage()));
        }
    }
}
