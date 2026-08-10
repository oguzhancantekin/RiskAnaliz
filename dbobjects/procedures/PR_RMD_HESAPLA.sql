CREATE OR REPLACE PROCEDURE PR_RMD_HESAPLA(
    p_fonkodu IN VARCHAR2,
    p_tarih IN DATE
) AS
    v_volatilite NUMBER;
    v_rmd NUMBER;
BEGIN
    -- 1. RMD (Riske Maruz Değer - Value at Risk) hesabı için öncelikle Volatilite (Standart Sapma) gereklidir.
    -- Bu yüzden daha önceden hesaplanan volatilite oranını tablodan okuyoruz.
    SELECT VOLATILITE
    INTO v_volatilite
    FROM TB_RISK_SONUC
    WHERE FON_KODU = p_fonkodu AND HESAPLAMA_TARIHI = p_tarih;

    -- 2. Parametrik (Varyans-Kovaryans) RMD Formülü (Haftalık %99 Güven Aralığı):
    -- Yıllık Volatilite (252 gün) üzerinden hesaplandığı için, 1 haftalık (5 iş günü) riske dönerken SQRT(52) yerine SQRT(5/252) kullanmak matematiksel olarak daha tutarlıdır.
    -- Z-Score: %99 güven aralığı için istatistiksel normal dağılım (çan eğrisi) standart tam değeri 2.326348'dir.
    -- Formül: Volatilite * Z-Score * Karekök(Hesaplanacak Süre / Yıllık Süre)
    -- Yorum: Bu fon %99 ihtimalle önümüzdeki 1 hafta içinde hesaplanan "VAR_RMD" yüzdesinden daha fazla DÜŞMEYECEKTİR.
    v_rmd := (v_volatilite * 2.326348 * SQRT(5 / 252)) * 100;
        
    UPDATE TB_RISK_SONUC
    SET VAR_RMD = v_rmd
    WHERE FON_KODU = p_fonkodu AND HESAPLAMA_TARIHI = p_tarih;
EXCEPTION
    WHEN OTHERS THEN
        RAISE_APPLICATION_ERROR(-20001, 'RMD Hesaplarken Hata: ' || SQLERRM);
END;

