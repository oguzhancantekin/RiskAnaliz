package com.demo.riskanaliz.daoServices.impl;

import com.demo.riskanaliz.daoServices.TefasFonDao;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Types;
import java.util.List;

@Repository
public class TefasFonDaoImpl implements TefasFonDao {

    private final JdbcTemplate jdbcTemplate;

    public TefasFonDaoImpl(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
        System.out.println(">>> 🚀 TEFAS FON dao NESNESİ SPRING TARAFINDAN OLUŞTURULDU! <<<");
    }

    @Override
    public void saveFonListesi(List<Object[]> fonList) {
        // [0: FON_KODU, 1: FON_ADI, 2: FON_TURU]
        String sql = "CALL PR_SAVE_FON(?, ?, ?)";
        int[] types = { Types.VARCHAR, Types.VARCHAR, Types.VARCHAR };
        jdbcTemplate.batchUpdate(sql, fonList, types);
    }

    @Override
    public void saveFonFiyatlari(List<Object[]> fiyatList) {
        // [0: FON_KODU, 1: TARIH, 2: BIRIM_FIYAT]
        String sql = "CALL PR_SAVE_FON_FIYAT(?, ?, ?)";
        int[] types = { Types.VARCHAR, Types.DATE, Types.NUMERIC };
        jdbcTemplate.batchUpdate(sql, fiyatList, types);
    }
}
