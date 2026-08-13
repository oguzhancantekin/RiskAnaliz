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

    public RiskDaoImpl(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
        System.out.println(">>> 🚀 RISK dao NESNESİ SPRING TARAFINDAN OLUŞTURULDU! <<<");
    }

    @Override
    public int tumRiskleriHesapla(Date tarih, String fonKodu) {
        // Süslü parantez olmadan Oracle driver "bad SQL grammar" hatası fırlatır.
        // İkinci parametre (fonKodu) null gelse bile JDBC bunu veritabanına NULL olarak geçirir.
        String sql = "CALL PR_TUM_RISKLERI_HESAPLA(?, ?)";
        jdbcTemplate.update(sql, tarih, fonKodu);

        // Prosedür tamamlandıktan sonra o tarih için kaç fon sonucu üretildiğini
        // sayıyoruz.
        // NOT: SQL'de "FON_KODU = NULL" hiçbir zaman true dönmez; fonKodu null ise
        // filtreyi tamamen çıkarmak gerekir.
        Integer count;
        if (fonKodu != null && !fonKodu.isBlank()) {
            count = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM TB_RISK_SONUC WHERE HESAPLAMA_TARIHI = ? AND FON_KODU = ?",
                    Integer.class, tarih, fonKodu);
        } else {
            count = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM TB_RISK_SONUC WHERE HESAPLAMA_TARIHI = ?",
                    Integer.class, tarih);
        }
        return count != null ? count : 0;
    }

    @Override
    public List<RiskSonucDTO> getSonuclar(String fonKodu) {
        // Veritabanından cursor dönen bir Stored Procedure çağırmak için
        // Spring JDBC'nin SimpleJdbcCall sınıfını kullanıyoruz.
        SimpleJdbcCall jdbcCall = new SimpleJdbcCall(jdbcTemplate)
                .withProcedureName("PR_GET_RISK_SONUCLARI")
                // Prosedürün döndüreceği 'p_cursor' adlı OUT parametresini yakalıyoruz.
                // BeanPropertyRowMapper ile veritabanından dönen sütun isimlerini RiskSonucDTO
                // sınıfındaki alan isimleriyle otomatik eşleştiriyoruz.
                .returningResultSet("p_cursor", BeanPropertyRowMapper.newInstance(RiskSonucDTO.class));

        // Prosedüre varsa 'fonKodu' parametresini göndererek komutu çalıştırıyoruz.
        Map<String, Object> out = jdbcCall.execute(new MapSqlParameterSource("p_fonkodu", fonKodu));

        // Dönen Map içerisinden eşleştirilmiş DTO listesini çıkarıyoruz.
        @SuppressWarnings("unchecked")
        List<RiskSonucDTO> list = (List<RiskSonucDTO>) out.get("p_cursor");

        // Null pointer hatası (NPE) almamak için liste boşsa (null) boş bir liste dönüyoruz.
        return list != null ? list : new ArrayList<>();
    }
}
