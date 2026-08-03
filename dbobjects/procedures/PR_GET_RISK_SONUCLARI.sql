CREATE OR REPLACE PROCEDURE PR_GET_RISK_SONUCLARI(
    p_fonkodu IN VARCHAR2,
    p_cursor OUT SYS_REFCURSOR
) AS
BEGIN
    OPEN p_cursor FOR
        SELECT r.FON_KODU, 
               TO_CHAR(r.HESAPLAMA_TARIHI, 'YYYY-MM-DD') AS HESAPLAMA_TARIHI, 
               r.BETA, r.ALPHA, r.SHARPE, r.SORTINO, r.TREYNOR, r.VOLATILITE, r.VAR_RMD, 
               r.DOWNSIDE_RISK, r.DEGISIM_KATSAYISI, r.GUNLUK_GETIRI, r.YILLIK_GETIRI, 
               f.FON_ADI, f.FON_TURU AS SEMSIYE, f.FON_KATEGORI, f.KURUCU 
        FROM TB_RISK_SONUC r 
        LEFT JOIN TB_FONLAR f ON r.FON_KODU = f.FON_KODU 
        WHERE r.HESAPLAMA_TARIHI = (SELECT MAX(HESAPLAMA_TARIHI) FROM TB_RISK_SONUC) -- burda da aynı şekilde maxı bir değişkene atayıp o şekilde bakman index varsa hızlandıracaktır.
          AND NVL(f.DURUM, 'AKTIF') = 'AKTIF' -- aktif olanları getir, boş olanları da aktif say getir.
          AND (p_fonkodu IS NULL OR TRIM(p_fonkodu) IS NULL OR r.FON_KODU = TRIM(p_fonkodu)) --trim(p_fonkodu)
        ORDER BY r.FON_KODU ASC;
END;
/
