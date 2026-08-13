package com.demo.riskanaliz.service.impl;

import com.demo.riskanaliz.daoServices.RiskDao;
import com.demo.riskanaliz.dto.RiskSonucDTO;
import com.demo.riskanaliz.service.RiskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;

@Service
public class RiskServiceImpl implements RiskService {

    @Autowired
    private RiskDao riskDao;

    @Override
    @Transactional // Bu metodun bir veritabanı transaction (işlem) bloğu içinde çalışmasını sağlar. Hata olursa tüm veritabanı işlemleri geri alınır (rollback).
    public void hesaplamayiBaslat(Date tarih, String fonKodu) {
        if (tarih == null) {
            throw new IllegalArgumentException("Hesaplama tarihi boş olamaz!");
        }
        
        // DAO katmanına yönlendiriyoruz.
        riskDao.tumRiskleriHesapla(tarih, fonKodu);
    }

    @Override
    public List<RiskSonucDTO> getSonuclar(String fonKodu) {
        // Şu an doğrudan Data Access Object (DAO) katmanına yönlendirme yapıyor.
        return riskDao.getSonuclar(fonKodu);
    }
}
