package com.demo.riskanaliz.service;

import org.springframework.web.multipart.MultipartFile;

public interface EndeksService {
    // BIST100 (Investing.com) verilerini çözmek için
    void processEndeksCsv(MultipartFile file) throws Exception;
}
