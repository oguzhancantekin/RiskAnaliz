CREATE OR REPLACE PROCEDURE PR_DEGISIM_KATSAYISI_HESAPLA(
    p_fonkodu IN VARCHAR2,
    p_tarih IN DATE
) AS
    v_yillik_getiri NUMBER;
    v_volatilite NUMBER;
    v_cv NUMBER;
BEGIN
    -- 1. Fonun daha önceden hesaplanmış 'Yıllık Getirisi' ve 'Volatilite' (Risk) oranını tablodan alıyoruz.
    SELECT YILLIK_GETIRI / 100, VOLATILITE
    INTO v_yillik_getiri, v_volatilite
    FROM TB_RISK_SONUC
    WHERE FON_KODU = p_fonkodu AND HESAPLAMA_TARIHI = p_tarih;

    -- 2. Değişim Katsayısının Hesaplanması
    -- Sadece getiri sıfırdan büyükse hesaplanır (Sıfıra bölme hatasını önlemek için)
    IF NVL(v_yillik_getiri, 0) > 0 THEN
        -- Değişim Katsayısı (Coefficient of Variation - CV) Formülü: Volatilite / Yıllık Getiri
        -- Yorum: Elde edilen 1 birimlik getiri başına ne kadar risk üstlenildiğini gösterir. (Düşük olması daha iyidir).
        -- Sharpe oranının tersi gibi düşünülebilir ancak risksiz getiriyi işleme katmaz.
        v_cv := v_volatilite / v_yillik_getiri;
        
        -- Bulunan katsayıyı ilgili fon ve tarih için risk tablosuna güncelliyoruz
        UPDATE TB_RISK_SONUC
        SET DEGISIM_KATSAYISI = v_cv
        WHERE FON_KODU = p_fonkodu AND HESAPLAMA_TARIHI = p_tarih;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE_APPLICATION_ERROR(-20001, 'CV Hesaplarken Hata: ' || SQLERRM);
END;
/
