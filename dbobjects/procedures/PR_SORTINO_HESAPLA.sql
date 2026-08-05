CREATE OR REPLACE PROCEDURE PR_SORTINO_HESAPLA(
    p_fonkodu IN VARCHAR2,
    p_tarih IN DATE
) AS
    v_risksiz_getiri NUMBER; 
    v_yillik_getiri NUMBER;
    v_downside_risk NUMBER;
    v_sortino NUMBER;
BEGIN
    -- 1. Sistem parametrelerinden Risksiz Getiri oranını (Örn: yıllık %42) çekip işleme uygun hale getirmek için yüze (0.42) bölüyoruz
    SELECT DEGER / 100 INTO v_risksiz_getiri 
    FROM TB_SISTEM_PARAMETRE 
    WHERE PARAMETRE_ADI = 'RISKSIZ_GETIRI_ORANI';

    -- 2. Fonun 'Yıllık Getirisini' ve 'Aşağı Yönlü Riskini' (Downside Risk) risk sonuç tablosundan okuyoruz
    SELECT YILLIK_GETIRI / 100, DOWNSIDE_RISK
    INTO v_yillik_getiri, v_downside_risk
    FROM TB_RISK_SONUC
    WHERE FON_KODU = p_fonkodu AND HESAPLAMA_TARIHI = p_tarih;

    -- 3. Sortino Oranının Hesaplanması
    -- Sadece downside_risk sıfırdan büyükse hesaplama yapılır (Sıfıra bölme hatasını önlemek için)
    IF NVL(v_downside_risk, 0) > 0 THEN
        -- Sortino Oranı Formülü: (Fonun Yıllık Getirisi - Risksiz Getiri) / Aşağı Yönlü Risk
        -- Yorum: Sharpe oranına benzer ancak toplam risk (Volatilite) yerine sadece kaybettirme riski (Downside) dikkate alınır.
        v_sortino := (v_yillik_getiri - v_risksiz_getiri) / v_downside_risk;
        
        -- Bulunan Sortino oranını ilgili fon ve hesaplama tarihi için tabloya güncelliyoruz
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
