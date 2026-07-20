package com.demo.riskanaliz.daoServices;

import java.util.Date;

public interface RiskDao {
    /**
     * Veritabanındaki PR_TUM_RISKLERI_HESAPLA prosedürünü tetikler.
     * @param tarih Hesaplamanın yapılacağı tarih
     */
    void tumRiskleriHesapla(Date tarih);

    /**
     * Veritabanından hesaplanmış risk sonuçlarını getirir.
     * @param fonKodu Opsiyonel fon kodu filtresi (boş ise tümünü getirir)
     * @return Tablo satırlarını Map listesi olarak döner
     */
    java.util.List<java.util.Map<String, Object>> getSonuclar(String fonKodu);
}
