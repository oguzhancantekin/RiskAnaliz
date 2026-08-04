package com.demo.riskanaliz.daoServices.impl;

import com.demo.riskanaliz.daoServices.RiskDao;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.ColumnMapRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import com.demo.riskanaliz.dto.RiskSonucDTO;
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
    private final JdbcTemplate jdbcTemplate;

    public RiskDaoImpl(JdbcTemplate jdbcTemplate){
        this.jdbcTemplate = jdbcTemplate;
        System.out.println(">>> 🚀 RISK dao NESNESİ SPRING TARAFINDAN OLUŞTURULDU! <<<");
    }

    @Override
    public void tumRiskleriHesapla(Date tarih) {
        String sql = "CALL PR_TUM_RISKLERI_HESAPLA(?)";
        jdbcTemplate.update(sql, tarih);
    }

    @Override
    public List<RiskSonucDTO> getSonuclar(String fonKodu) {
        SimpleJdbcCall jdbcCall = new SimpleJdbcCall(jdbcTemplate)
                .withProcedureName("PR_GET_RISK_SONUCLARI")
                .returningResultSet("p_cursor", BeanPropertyRowMapper.newInstance(RiskSonucDTO.class));

        Map<String, Object> out = jdbcCall.execute(new MapSqlParameterSource("p_fonkodu", fonKodu));
        
        @SuppressWarnings("unchecked")
        List<RiskSonucDTO> list = (List<RiskSonucDTO>) out.get("p_cursor");

        return list != null ? list : new ArrayList<>();
    }
}
