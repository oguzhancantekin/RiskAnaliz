CREATE OR REPLACE PROCEDURE PR_ALPHA_HESAPLA(
    p_fonkodu IN VARCHAR2,
    p_tarih IN DATE
) AS
    v_risksiz_getiri NUMBER; 
    v_yillik_getiri NUMBER;
    v_beta NUMBER;
    v_endeks_getiri NUMBER;
    v_alpha NUMBER;
BEGIN
    -- Sistem parametrelerinden Risksiz Getiri oranını (Örn: 42) çekip yüzdeye (0.42) çeviriyoruz
    SELECT DEGER / 100 INTO v_risksiz_getiri 
    FROM TB_SISTEM_PARAMETRE 
    WHERE PARAMETRE_ADI = 'RISKSIZ_GETIRI_ORANI';

    SELECT YILLIK_GETIRI / 100, BETA
    INTO v_yillik_getiri, v_beta
    FROM TB_RISK_SONUC
    WHERE FON_KODU = p_fonkodu AND HESAPLAMA_TARIHI = p_tarih;

    WITH EndeksFiyatlar AS (
        SELECT FIYAT,
               ROW_NUMBER() OVER (ORDER BY TARIH ASC) as rn_asc,
               ROW_NUMBER() OVER (ORDER BY TARIH DESC) as rn_desc
        FROM TB_ENDEKS_FIYAT
        WHERE ENDEKS_KODU = 'BIST100'
          AND TARIH BETWEEN ADD_MONTHS(p_tarih, -12) AND p_tarih --buradaki add_months işlemini select dışında yapalım TB_ENDEKS_FIYAT tablosuna tarih indeksi koymuşsun onu engelliyor.
    )
    SELECT ( (SELECT FIYAT FROM EndeksFiyatlar WHERE rn_desc = 1) - (SELECT FIYAT FROM EndeksFiyatlar WHERE rn_asc = 1) ) 
           / NULLIF((SELECT FIYAT FROM EndeksFiyatlar WHERE rn_asc = 1), 0)
    INTO v_endeks_getiri
    FROM DUAL;

    IF v_beta IS NOT NULL THEN
        v_alpha := (v_yillik_getiri - (v_risksiz_getiri + v_beta * (v_endeks_getiri - v_risksiz_getiri))) * 100;
        
        UPDATE TB_RISK_SONUC
        SET ALPHA = v_alpha
        WHERE FON_KODU = p_fonkodu AND HESAPLAMA_TARIHI = p_tarih;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE_APPLICATION_ERROR(-20001, 'Alpha Hesaplarken Hata: ' || SQLERRM);
END;
/
