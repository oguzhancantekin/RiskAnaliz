package com.demo.riskanaliz.service;

import java.util.Date;

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
    java.util.List<java.util.Map<String, Object>> getSonuclar(String fonKodu);
}
