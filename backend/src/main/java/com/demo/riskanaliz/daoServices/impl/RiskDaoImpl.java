package com.demo.riskanaliz.daoServices.impl;

import com.demo.riskanaliz.daoServices.RiskDao;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.Date;

@Repository
public class RiskDaoImpl implements RiskDao {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void tumRiskleriHesapla(Date tarih) {
        String sql = "CALL PR_TUM_RISKLERI_HESAPLA(?)";
        jdbcTemplate.update(sql, tarih);
    }

    @Override
    public java.util.List<java.util.Map<String, Object>> getSonuclar(String fonKodu) {
        String sql = "SELECT * FROM TB_RISK_SONUC ";
        
        if (fonKodu != null && !fonKodu.trim().isEmpty()) {
            sql += "WHERE FON_KODU = ? ORDER BY HESAPLAMA_TARIHI DESC FETCH FIRST 100 ROWS ONLY";
            return jdbcTemplate.queryForList(sql, fonKodu);
        } else {
            sql += "ORDER BY HESAPLAMA_TARIHI DESC FETCH FIRST 100 ROWS ONLY";
            return jdbcTemplate.queryForList(sql);
        }
    }
}
