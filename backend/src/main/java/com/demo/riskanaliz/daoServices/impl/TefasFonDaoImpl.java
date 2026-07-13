package com.demo.riskanaliz.daoServices.impl;

import com.demo.riskanaliz.daoServices.TefasFonDao;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Types;
import java.util.List;

@Repository
public class TefasFonDaoImpl implements TefasFonDao {

    private final JdbcTemplate jdbcTemplate;

    // JdbcTemplate'i Spring otomatik olarak içeri enjekte eder (Dependency
    // Injection)
    public TefasFonDaoImpl(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void saveFonListesi(List<Object[]> fonList) {
        String sql = """
                MERGE INTO TB_FONLAR f
                USING (SELECT ? AS FON_KODU, ? AS FON_ADI FROM DUAL) src
                ON (f.FON_KODU = src.FON_KODU)
                WHEN NOT MATCHED THEN
                    INSERT (FON_KODU, FON_ADI, DURUM)
                    VALUES (src.FON_KODU, src.FON_ADI, 'AKTIF')
                """;

        int[] types = { Types.VARCHAR, Types.VARCHAR };
        // Toplu (Batch) olarak gönderiyoruz ki çok hızlı olsun
        jdbcTemplate.batchUpdate(sql, fonList, types);
    }

    @Override
    public void saveFonFiyatlari(List<Object[]> fiyatList) {
        String sql = """
                MERGE INTO TB_FON_FIYAT f
                USING (SELECT ? AS FON_KODU, ? AS TARIH, ? AS BIRIM_FIYAT FROM DUAL) src
                ON (f.FON_KODU = src.FON_KODU AND f.TARIH = src.TARIH)
                WHEN MATCHED THEN
                    UPDATE SET f.BIRIM_FIYAT = src.BIRIM_FIYAT
                WHEN NOT MATCHED THEN
                    INSERT (FON_KODU, TARIH, BIRIM_FIYAT)
                    VALUES (src.FON_KODU, src.TARIH, src.BIRIM_FIYAT)
                """;

        int[] types = { Types.VARCHAR, Types.DATE, Types.NUMERIC };
        jdbcTemplate.batchUpdate(sql, fiyatList, types);
    }

    @Override
    public void updateFonTuru(List<Object[]> fonTuruList) {
        // fonTuruList dizilimi -> [0: FON_TURU, 1: FON_KODU]
        // Sadece FON_TURU sütununu güncelliyoruz (UPDATE).
        String sql = "UPDATE TB_FONLAR SET FON_TURU = ? WHERE FON_KODU = ?";

        int[] types = { Types.VARCHAR, Types.VARCHAR };
        jdbcTemplate.batchUpdate(sql, fonTuruList, types);
    }
}
