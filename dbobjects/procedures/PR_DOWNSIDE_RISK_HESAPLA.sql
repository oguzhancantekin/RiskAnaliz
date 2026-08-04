CREATE OR REPLACE PROCEDURE PR_DOWNSIDE_RISK_HESAPLA(
    p_fonkodu IN VARCHAR2,
    p_tarih IN DATE
) AS
    v_downside_risk NUMBER;
    v_baslangic_tarihi DATE;
BEGIN
    v_baslangic_tarihi := ADD_MONTHS(p_tarih, -12);

    WITH FonGetiri AS (
        SELECT 
            (BIRIM_FIYAT - LAG(BIRIM_FIYAT) OVER (ORDER BY TARIH)) / NULLIF(LAG(BIRIM_FIYAT) OVER (ORDER BY TARIH), 0) AS F_GETIRI
        FROM TB_FON_FIYAT
        WHERE FON_KODU = p_fonkodu
          AND TARIH BETWEEN v_baslangic_tarihi AND p_tarih
    )
    -- Tıpkı Volatilitede (STDDEV_SAMP) olduğu gibi, burada da popülasyon (N) yerine örneklem (N-1) varyansını baz alıyoruz: COUNT(*) - 1
    SELECT NVL(SQRT(SUM(POWER(LEAST(0, F_GETIRI), 2)) / (COUNT(*) - 1)) * SQRT(252), 0)
    INTO v_downside_risk
    FROM FonGetiri
    WHERE F_GETIRI IS NOT NULL;

    UPDATE TB_RISK_SONUC
    SET DOWNSIDE_RISK = v_downside_risk
    WHERE FON_KODU = p_fonkodu AND HESAPLAMA_TARIHI = p_tarih;
EXCEPTION
    WHEN OTHERS THEN
        RAISE_APPLICATION_ERROR(-20001, 'Downside Risk Hesaplarken Hata: ' || SQLERRM);
END;
/
