package com.demo.riskanaliz.daoServices;

import java.util.Date;
import java.util.List;
import com.demo.riskanaliz.dto.RiskSonucDTO;

public interface RiskDao {
    /**
     * Veritabanındaki PR_TUM_RISKLERI_HESAPLA prosedürünü tetikler.
     * @param tarih Hesaplamanın yapılacağı tarih
     * @param fonKodu Opsiyonel fon kodu filtresi (boş ise tüm aktif fonlar)
     * @return Hesaplanan fon sayısı
     */
    int tumRiskleriHesapla(Date tarih, String fonKodu);

    /**
     * Veritabanından hesaplanmış risk sonuçlarını getirir.
     * @param fonKodu Opsiyonel fon kodu filtresi (boş ise tümünü getirir)
     * @return Risk sonuçları listesi
     */
    List<RiskSonucDTO> getSonuclar(String fonKodu);
}
