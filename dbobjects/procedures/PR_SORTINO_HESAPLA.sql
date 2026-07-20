CREATE OR REPLACE PROCEDURE PR_SORTINO_HESAPLA(
    p_fonkodu IN VARCHAR2,
    p_tarih IN DATE
) AS
    v_risksiz_getiri NUMBER; 
    v_yillik_getiri NUMBER;
    v_downside_risk NUMBER;
    v_sortino NUMBER;
BEGIN
    -- Sistem parametrelerinden Risksiz Getiri oranını (Örn: 42) çekip yüzdeye (0.42) çeviriyoruz
    SELECT DEGER / 100 INTO v_risksiz_getiri 
    FROM TB_SISTEM_PARAMETRE 
    WHERE PARAMETRE_ADI = 'RISKSIZ_GETIRI_ORANI';

    SELECT YILLIK_GETIRI / 100, DOWNSIDE_RISK
    INTO v_yillik_getiri, v_downside_risk
    FROM TB_RISK_SONUC
    WHERE FON_KODU = p_fonkodu AND HESAPLAMA_TARIHI = p_tarih;

    IF NVL(v_downside_risk, 0) > 0 THEN
        v_sortino := (v_yillik_getiri - v_risksiz_getiri) / v_downside_risk;
        
        UPDATE TB_RISK_SONUC
        SET SORTINO = v_sortino
        WHERE FON_KODU = p_fonkodu AND HESAPLAMA_TARIHI = p_tarih;
    ELSE
        -- Downside risk 0 veya null ise, tabloda eski hatalı (çöp) veri kalmasın diye NULL'a çekilir.
        UPDATE TB_RISK_SONUC
        SET SORTINO = NULL
        WHERE FON_KODU = p_fonkodu AND HESAPLAMA_TARIHI = p_tarih;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE_APPLICATION_ERROR(-20001, 'Sortino Hesaplarken Hata: ' || SQLERRM);
END;
/
