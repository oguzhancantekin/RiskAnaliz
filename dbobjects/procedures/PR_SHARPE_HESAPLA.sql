CREATE OR REPLACE PROCEDURE PR_SHARPE_HESAPLA(
    p_fonkodu IN VARCHAR2,
    p_tarih IN DATE
) AS
    v_risksiz_getiri NUMBER; 
    v_yillik_getiri NUMBER;
    v_volatilite NUMBER;
    v_sharpe NUMBER;
BEGIN
    -- Sistem parametrelerinden Risksiz Getiri oranını (Örn: 42) çekip yüzdeye (0.42) çeviriyoruz
    SELECT DEGER / 100 INTO v_risksiz_getiri 
    FROM TB_SISTEM_PARAMETRE 
    WHERE PARAMETRE_ADI = 'RISKSIZ_GETIRI_ORANI';

    SELECT YILLIK_GETIRI / 100, VOLATILITE
    INTO v_yillik_getiri, v_volatilite
    FROM TB_RISK_SONUC
    WHERE FON_KODU = p_fonkodu AND HESAPLAMA_TARIHI = p_tarih;

    IF NVL(v_volatilite, 0) > 0 THEN
        v_sharpe := (v_yillik_getiri - v_risksiz_getiri) / v_volatilite;
        
        UPDATE TB_RISK_SONUC
        SET SHARPE = v_sharpe
        WHERE FON_KODU = p_fonkodu AND HESAPLAMA_TARIHI = p_tarih;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE_APPLICATION_ERROR(-20001, 'Sharpe Hesaplarken Hata: ' || SQLERRM);
END;
/
