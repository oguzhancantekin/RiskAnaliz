package com.demo.riskanaliz.daoServices.impl;

import com.demo.riskanaliz.daoServices.EndeksDao;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Types;
import java.util.List;

@Repository
public class EndeksDaoImpl implements EndeksDao {

    private final JdbcTemplate jdbcTemplate;

    public EndeksDaoImpl(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void saveEndeksFiyatlari(List<Object[]> endeksList) {
        // endeksList dizilimi -> [0: ENDEKS_KODU, 1: TARIH, 2: FIYAT]
        String sql = """
                MERGE INTO TB_ENDEKS_FIYAT e
                USING (SELECT ? AS ENDEKS_KODU, ? AS TARIH, ? AS FIYAT FROM DUAL) src
                ON (e.ENDEKS_KODU = src.ENDEKS_KODU AND e.TARIH = src.TARIH)
                WHEN MATCHED THEN
                    UPDATE SET e.FIYAT = src.FIYAT
                WHEN NOT MATCHED THEN
                    INSERT (ENDEKS_KODU, TARIH, FIYAT)
                    VALUES (src.ENDEKS_KODU, src.TARIH, src.FIYAT)
                """;

        int[] types = { Types.VARCHAR, Types.DATE, Types.NUMERIC };
        // Toplu batch gönderim hızlı olsun diye
        jdbcTemplate.batchUpdate(sql, endeksList, types);
    }
}
