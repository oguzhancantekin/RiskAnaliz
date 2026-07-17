CREATE OR REPLACE PROCEDURE PR_VOLATILITE_HESAPLA(
    p_fonkodu IN VARCHAR2,
    p_tarih IN DATE
) AS
    v_volatilite NUMBER;
BEGIN
    -- 1. ADIM: Matematiksel Volatilite Formülü
    -- Elimizde her günün getirisi bir tabloda kayıtlı değil. 
    -- Sadece günlük FİYATLAR var.
    -- WITH bloğu ile RAM'de sanal bir tablo oluşturuyoruz.
    -- LAG(BIRIM_FIYAT) fonksiyonu, her fiyatın yanına "Dünkü Fiyatı" yazdırır.
    
    WITH GunlukGetiriler AS (
        SELECT 
            TARIH,
            BIRIM_FIYAT,
            LAG(BIRIM_FIYAT) OVER (ORDER BY TARIH) AS DUNKU_FIYAT
        FROM TB_FON_FIYAT
        WHERE FON_KODU = p_fonkodu
          AND TARIH BETWEEN ADD_MONTHS(p_tarih, -12) AND p_tarih
    )
    -- RAM'de oluşan bu tablodan (Bugün - Dün)/Dün formülüyle getiriyi anlık hesaplayıp,
    -- Doğrudan STDDEV_SAMP (Standart Sapma) değerini alıyor ve SQRT(252) ile çarpıyoruz.
    -- ORA-01476 (Sıfıra bölme) hatasını engellemek için NULLIF(DUNKU_FIYAT, 0) kullanıyoruz.
    SELECT STDDEV_SAMP((BIRIM_FIYAT - DUNKU_FIYAT) / NULLIF(DUNKU_FIYAT, 0)) * SQRT(252)
    INTO v_volatilite
    FROM GunlukGetiriler
    WHERE DUNKU_FIYAT > 0; -- Hem dünkü fiyatı NULL olan ilk günü, hem de fiyatı 0 veya eksi olan hatalı verileri dışlıyoruz.

    -- 2. ADIM: Sonucu Veritabanına Yazma (Idempotent MERGE)
    IF v_volatilite IS NOT NULL THEN
        MERGE INTO TB_RISK_SONUC trs
        USING (SELECT p_fonkodu AS FON, p_tarih AS TAR, v_volatilite AS VOL FROM DUAL) src
        ON (trs.FON_KODU = src.FON AND trs.HESAPLAMA_TARIHI = src.TAR)
        WHEN MATCHED THEN
            UPDATE SET trs.VOLATILITE = src.VOL
        WHEN NOT MATCHED THEN
            INSERT (FON_KODU, HESAPLAMA_TARIHI, VOLATILITE)
            VALUES (src.FON, src.TAR, src.VOL);
    END IF;

EXCEPTION
    WHEN OTHERS THEN
        RAISE_APPLICATION_ERROR(-20001, 'Volatilite Hesaplarken Hata: ' || SQLERRM);
END;
/
