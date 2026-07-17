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

    v_rmd := (v_volatilite * 2.326 / SQRT(52)) * 100; --2.326 değeri yüzde 99 olarak hesaplar daha kesin konuşabiliriz. / Değeri 1.645 yaparsak %95 oranında hesaplarız.
                                                      -- 1 haftada yüzde 99 ihtimalle max %v_rmd kadar kayıp yaşayabilirsiniz
        
    UPDATE TB_RISK_SONUC
    SET VAR_RMD = v_rmd
    WHERE FON_KODU = p_fonkodu AND HESAPLAMA_TARIHI = p_tarih;
EXCEPTION
    WHEN OTHERS THEN
        RAISE_APPLICATION_ERROR(-20001, 'RMD Hesaplarken Hata: ' || SQLERRM);
END;
/
