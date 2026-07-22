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
        String sql = "SELECT r.FON_KODU, TO_CHAR(r.HESAPLAMA_TARIHI, 'YYYY-MM-DD') AS HESAPLAMA_TARIHI, " +
                     "r.BETA, r.ALPHA, r.SHARPE, r.SORTINO, r.TREYNOR, r.VOLATILITE, r.VAR_RMD, " +
                     "r.DOWNSIDE_RISK, r.DEGISIM_KATSAYISI, r.GUNLUK_GETIRI, r.YILLIK_GETIRI, " +
                     "f.FON_ADI, f.FON_TURU AS SEMSIYE " +
                     "FROM TB_RISK_SONUC r " +
                     "LEFT JOIN TB_FONLAR f ON r.FON_KODU = f.FON_KODU " +
                     "WHERE r.HESAPLAMA_TARIHI = (SELECT MAX(HESAPLAMA_TARIHI) FROM TB_RISK_SONUC) " +
                     "AND r.FON_KODU NOT IN ('NMG', 'OSF', 'HUS', 'PDR', 'ZJR', 'UZY') ";

        java.util.List<java.util.Map<String, Object>> list;
        if (fonKodu != null && !fonKodu.trim().isEmpty()) {
            sql += "AND r.FON_KODU = ? ORDER BY r.FON_KODU ASC";
            list = jdbcTemplate.queryForList(sql, fonKodu);
        } else {
            sql += "ORDER BY r.FON_KODU ASC";
            list = jdbcTemplate.queryForList(sql);
        }

        java.util.List<java.util.Map<String, Object>> sanitizedList = new java.util.ArrayList<>();
        for (java.util.Map<String, Object> map : list) {
            java.util.Map<String, Object> cleanMap = new java.util.HashMap<>();
            for (java.util.Map.Entry<String, Object> entry : map.entrySet()) {
                Object val = entry.getValue();
                if (val instanceof java.util.Date) {
                    cleanMap.put(entry.getKey(), val.toString());
                } else {
                    cleanMap.put(entry.getKey(), val);
                }
            }
            sanitizedList.add(cleanMap);
        }
        return sanitizedList;
    }
}
