package com.demo.riskanaliz.service;

import com.demo.riskanaliz.dto.RiskSonucDTO;
import java.util.Date;
import java.util.List;

public interface RiskService {
    /**
     * Kullanıcının girdiği tarih için tüm risk hesaplamalarını başlatır.
     * @param tarih Seçilen tarih
     */
    void hesaplamayiBaslat(Date tarih);

    /**
     * Veritabanından risk sonuçlarını çeker.
     * @param fonKodu Opsiyonel fon kodu
     * @return Risk sonuçları listesi
     */
    List<RiskSonucDTO> getSonuclar(String fonKodu);
}
