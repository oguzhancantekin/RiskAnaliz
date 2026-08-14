CREATE OR REPLACE PROCEDURE PR_BETA_HESAPLA(
    p_fonkodu IN VARCHAR2,
    p_tarih IN DATE
) AS
    v_beta NUMBER;
    v_baslangic_12 DATE;
    v_baslangic_13 DATE;
BEGIN
    v_baslangic_12 := ADD_MONTHS(p_tarih, -12);
    v_baslangic_13 := ADD_MONTHS(p_tarih, -13);

    -- 1. ADIM: Matematiksel Beta Formülü
    -- BETA = Kovaryans(Fon Getirisi, Endeks Getirisi) / Varyans(Endeks Getirisi)
    -- Alt sorgular (derived table) ile hem Fonun hem de Endeksin günlük getirilerini anlık olarak (RAM'de) hesaplıyoruz.
    -- Tarihler üzerinden iki tabloyu birleştirip (JOIN), COVAR_SAMP ve VAR_SAMP fonksiyonlarını uyguluyoruz
    SELECT 
        COVAR_SAMP(f.F_GETIRI, e.E_GETIRI) / NULLIF(VAR_SAMP(e.E_GETIRI), 0)
    INTO v_beta
    FROM (
        SELECT 
            TARIH,
            (BIRIM_FIYAT - LAG(BIRIM_FIYAT) OVER (ORDER BY TARIH)) / NULLIF(LAG(BIRIM_FIYAT) OVER (ORDER BY TARIH), 0) AS F_GETIRI
        FROM TB_FON_FIYAT
        WHERE FON_KODU = p_fonkodu
          AND TARIH BETWEEN v_baslangic_12 AND p_tarih
    ) f
    JOIN (
        SELECT 
            -- BIST100 getirisini, fonun yayımlandığı bir sonraki iş günü (T+1) ile eşleştirmek için LEAD kullanıyoruz.
            LEAD(TARIH) OVER (ORDER BY TARIH) AS TARIH,
            (FIYAT - LAG(FIYAT) OVER (ORDER BY TARIH)) / NULLIF(LAG(FIYAT) OVER (ORDER BY TARIH), 0) AS E_GETIRI
        FROM TB_ENDEKS_FIYAT
        WHERE ENDEKS_KODU = 'BIST100'
          AND TARIH BETWEEN v_baslangic_13 AND p_tarih -- Kaydırma yapacağımız için fazladan 1 ay geriden alıyoruz
    ) e ON f.TARIH = e.TARIH
    WHERE f.F_GETIRI IS NOT NULL AND e.E_GETIRI IS NOT NULL;

    -- 2. ADIM: Sonucu Veritabanına Yazma (Idempotent MERGE)
    IF v_beta IS NOT NULL THEN
        MERGE INTO TB_RISK_SONUC trs
        USING (SELECT p_fonkodu AS FON, p_tarih AS TAR, v_beta AS B FROM DUAL) src
        ON (trs.FON_KODU = src.FON AND trs.HESAPLAMA_TARIHI = src.TAR)
        WHEN MATCHED THEN
            UPDATE SET trs.BETA = src.B
        WHEN NOT MATCHED THEN
            INSERT (FON_KODU, HESAPLAMA_TARIHI, BETA)
            VALUES (src.FON, src.TAR, src.B);
    END IF;

EXCEPTION
    WHEN OTHERS THEN
        PR_LOG_HATA(p_fonkodu, 'PR_BETA_HESAPLA', SQLERRM);
END;

