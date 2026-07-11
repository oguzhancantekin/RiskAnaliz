package com.demo.riskanaliz.daoServices;

import java.util.List;

public interface TefasFonDao {
    // Fon listesini (kod ve ad) kaydetmek veya varsa es geçmek için
    void saveFonListesi(List<Object[]> fonList);
    
    // Günlük fiyatları kaydetmek veya o günün fiyatı zaten varsa güncellemek için
    void saveFonFiyatlari(List<Object[]> fiyatList);

    // Genel Bilgiler Excel'inden gelen Şemsiye Fon Türü'nü veritabanına işlemek için
    void updateFonTuru(List<Object[]> fonTuruList);
}
