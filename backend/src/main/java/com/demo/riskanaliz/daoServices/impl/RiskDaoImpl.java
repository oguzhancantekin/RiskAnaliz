package com.demo.riskanaliz.daoServices.impl;

import com.demo.riskanaliz.daoServices.RiskDao;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.ColumnMapRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.simple.SimpleJdbcCall;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;

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
    public List<Map<String, Object>> getSonuclar(String fonKodu) {
        SimpleJdbcCall jdbcCall = new SimpleJdbcCall(jdbcTemplate)
                .withProcedureName("PR_GET_RISK_SONUCLARI")
                .returningResultSet("p_cursor", new ColumnMapRowMapper());

        Map<String, Object> out = jdbcCall.execute(new MapSqlParameterSource("p_fonkodu", fonKodu));
        
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> list = (List<Map<String, Object>>) out.get("p_cursor");
        // Burada dönen sonuçların tipleri anlaşılır değil bir model katmanı oluşturup veri modellerini belirlemen hem dbden gelen veri alanlarını valide edecek hem takasbank yapısına daha uygun olacaktır.

        return list != null ? list : new ArrayList<>();
    }
}
