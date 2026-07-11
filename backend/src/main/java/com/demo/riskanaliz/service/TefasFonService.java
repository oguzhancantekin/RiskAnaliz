package com.demo.riskanaliz.service;

import org.springframework.web.multipart.MultipartFile;

public interface TefasFonService {
    void processTefasCsv(MultipartFile file) throws Exception;
    
    // Fon türlerini (Şemsiye Fon Türü) güncellemek için
    void updateFonTuruCsv(MultipartFile file) throws Exception;
}
