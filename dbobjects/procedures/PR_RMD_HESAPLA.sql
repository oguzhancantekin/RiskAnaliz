CREATE OR REPLACE PROCEDURE PR_RMD_HESAPLA(
    p_fonkodu IN VARCHAR2,
    p_tarih IN DATE
) AS
    v_volatilite NUMBER;
    v_rmd NUMBER;
BEGIN
    SELECT VOLATILITE
    INTO v_volatilite
    FROM TB_RISK_SONUC
    WHERE FON_KODU = p_fonkodu AND HESAPLAMA_TARIHI = p_tarih;

    -- Yıllık Volatilite (252 gün) üzerinden hesaplandığı için, 1 haftalık (5 iş günü) riske dönerken SQRT(52) yerine SQRT(5/252) kullanmak matematiksel olarak daha tutarlıdır.
    -- Z-Score: %99 güven aralığı için tam değer 2.326348'dir.
    v_rmd := (v_volatilite * 2.326348 * SQRT(5 / 252)) * 100;
        
    UPDATE TB_RISK_SONUC
    SET VAR_RMD = v_rmd
    WHERE FON_KODU = p_fonkodu AND HESAPLAMA_TARIHI = p_tarih;
EXCEPTION
    WHEN OTHERS THEN
        RAISE_APPLICATION_ERROR(-20001, 'RMD Hesaplarken Hata: ' || SQLERRM);
END;
/
