package com.demo.riskanaliz.service.impl;

import com.demo.riskanaliz.daoServices.RiskDao;
import com.demo.riskanaliz.service.RiskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
public class RiskServiceImpl implements RiskService {

    @Autowired
    private RiskDao riskDao;

    @Override
    public void hesaplamayiBaslat(Date tarih) {
        if (tarih == null) {
            throw new IllegalArgumentException("Hesaplama tarihi boş olamaz!");
        }
        
        // İş mantığı kontrolleri buraya eklenebilir. 
        // Örneğin gelecekteki bir tarih mi kontrol edilebilir vs.
        
        // Dao katmanına isteği gönder
        riskDao.tumRiskleriHesapla(tarih);
    }

    @Override
    public java.util.List<java.util.Map<String, Object>> getSonuclar(String fonKodu) {
        return riskDao.getSonuclar(fonKodu);
    }
}
