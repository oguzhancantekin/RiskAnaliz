CREATE OR REPLACE PROCEDURE PR_TREYNOR_HESAPLA(
    p_fonkodu IN VARCHAR2,
    p_tarih IN DATE
) AS
    v_risksiz_getiri NUMBER; 
    v_yillik_getiri NUMBER;
    v_beta NUMBER;
    v_treynor NUMBER;
BEGIN
    -- Sistem parametrelerinden Risksiz Getiri oranını (Örn: 42) çekip yüzdeye (0.42) çeviriyoruz
    SELECT DEGER / 100 INTO v_risksiz_getiri 
    FROM TB_SISTEM_PARAMETRE 
    WHERE PARAMETRE_ADI = 'RISKSIZ_GETIRI_ORANI';

    SELECT YILLIK_GETIRI / 100, BETA
    INTO v_yillik_getiri, v_beta
    FROM TB_RISK_SONUC
    WHERE FON_KODU = p_fonkodu AND HESAPLAMA_TARIHI = p_tarih;

    IF NVL(v_beta, 0) > 0 THEN
        v_treynor := ((v_yillik_getiri - v_risksiz_getiri) / v_beta) * 100;
        
        UPDATE TB_RISK_SONUC
        SET TREYNOR = v_treynor
        WHERE FON_KODU = p_fonkodu AND HESAPLAMA_TARIHI = p_tarih;
    ELSE
        UPDATE TB_RISK_SONUC
        SET TREYNOR = NULL
        WHERE FON_KODU = p_fonkodu AND HESAPLAMA_TARIHI = p_tarih;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE_APPLICATION_ERROR(-20001, 'Treynor Hesaplarken Hata: ' || SQLERRM);
END;
/
