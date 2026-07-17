CREATE OR REPLACE PROCEDURE PR_DEGISIM_KATSAYISI_HESAPLA(
    p_fonkodu IN VARCHAR2,
    p_tarih IN DATE
) AS
    v_yillik_getiri NUMBER;
    v_volatilite NUMBER;
    v_cv NUMBER;
BEGIN
    SELECT YILLIK_GETIRI / 100, VOLATILITE
    INTO v_yillik_getiri, v_volatilite
    FROM TB_RISK_SONUC
    WHERE FON_KODU = p_fonkodu AND HESAPLAMA_TARIHI = p_tarih;

    IF NVL(v_yillik_getiri, 0) > 0 THEN
        v_cv := v_volatilite / v_yillik_getiri;
        
        UPDATE TB_RISK_SONUC
        SET DEGISIM_KATSAYISI = v_cv
        WHERE FON_KODU = p_fonkodu AND HESAPLAMA_TARIHI = p_tarih;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE_APPLICATION_ERROR(-20001, 'CV Hesaplarken Hata: ' || SQLERRM);
END;
/
