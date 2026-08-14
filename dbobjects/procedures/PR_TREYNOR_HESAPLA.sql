CREATE OR REPLACE PROCEDURE PR_TREYNOR_HESAPLA(
    p_fonkodu IN VARCHAR2,
    p_tarih IN DATE
) AS
    v_risksiz_getiri NUMBER; 
    v_yillik_getiri NUMBER;
    v_beta NUMBER;
    v_treynor NUMBER;
BEGIN
    -- 1. Sistem parametrelerinden Risksiz Getiri oranını (Örn: yıllık %42) çekip matematiksel formüle uygun olması için yüze (0.42) bölüyoruz
    SELECT DEGER / 100 INTO v_risksiz_getiri 
    FROM TB_SISTEM_PARAMETRE 
    WHERE PARAMETRE_ADI = 'RISKSIZ_GETIRI_ORANI';

    -- 2. Fonun daha önceden hesaplanmış olan 'Yıllık Getirisi' ve 'Beta Katsayısını' risk sonuç tablosundan alıyoruz
    SELECT YILLIK_GETIRI / 100, BETA
    INTO v_yillik_getiri, v_beta
    FROM TB_RISK_SONUC
    WHERE FON_KODU = p_fonkodu AND HESAPLAMA_TARIHI = p_tarih;

    -- 3. Treynor Oranının Hesaplanması
    -- Fonun betası sıfırdan büyükse hesaplama yapılır. (Sıfıra veya negatife bölme hatasını önlemek için)
    IF NVL(v_beta, 0) > 0 THEN
        -- Treynor Oranı Formülü: (Fonun Yıllık Getirisi - Risksiz Getiri) / Fonun Betası * 100 --yüzde göstermek için
        -- Yorum: Sharpe oranına benzer, ancak toplam risk yerine sadece sistemsel (piyasa) riskine (Beta) karşılık ne kadar ekstra getiri sağlandığını ölçer.
        v_treynor := ((v_yillik_getiri - v_risksiz_getiri) / v_beta) * 100;
        
        -- Bulunan Treynor oranını ilgili fon ve tarih için risk tablosuna güncelliyoruz
        UPDATE TB_RISK_SONUC
        SET TREYNOR = v_treynor
        WHERE FON_KODU = p_fonkodu AND HESAPLAMA_TARIHI = p_tarih;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        PR_LOG_HATA(p_fonkodu, 'PR_TREYNOR_HESAPLA', SQLERRM);
END;

