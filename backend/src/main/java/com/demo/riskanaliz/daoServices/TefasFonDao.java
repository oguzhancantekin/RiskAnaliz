package com.demo.riskanaliz.daoServices;

import java.util.List;

public interface TefasFonDao {
    // Fon künyesini (Kod, Ad, Şemsiye Fon Türü) kaydetmek veya güncellemek için (PR_SAVE_FON)
    void saveFonListesi(List<Object[]> fonList);
    
    // Günlük fiyatları kaydetmek veya güncellemek için (PR_SAVE_FON_FIYAT)
    void saveFonFiyatlari(List<Object[]> fiyatList);
}
