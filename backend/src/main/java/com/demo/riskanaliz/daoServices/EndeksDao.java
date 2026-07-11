package com.demo.riskanaliz.daoServices;

import java.util.List;

public interface EndeksDao {
    // BIST100 gibi endekslerin günlük fiyatlarını veritabanına kaydetmek için
    void saveEndeksFiyatlari(List<Object[]> endeksList);
}
