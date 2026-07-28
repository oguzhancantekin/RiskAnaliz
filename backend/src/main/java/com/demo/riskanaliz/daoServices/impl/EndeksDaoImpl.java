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
        String sql = "CALL PR_SAVE_ENDEKS_FIYAT(?, ?, ?)";
        int[] types = { Types.VARCHAR, Types.DATE, Types.NUMERIC };
        jdbcTemplate.batchUpdate(sql, endeksList, types);
    }
}
