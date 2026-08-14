CREATE OR REPLACE PROCEDURE PR_SHARPE_HESAPLA(
    p_fonkodu IN VARCHAR2,
    p_tarih IN DATE
) AS
    v_risksiz_getiri NUMBER; 
    v_yillik_getiri NUMBER;
    v_volatilite NUMBER;
    v_sharpe NUMBER;
BEGIN
    -- Sistem parametrelerinden Risksiz Getiri oranını (Örn: yıllık %42) çekip formüle uygun hale getirmek için yüze (0.42) bölüyoruz
    SELECT DEGER / 100 INTO v_risksiz_getiri 
    FROM TB_SISTEM_PARAMETRE 
    WHERE PARAMETRE_ADI = 'RISKSIZ_GETIRI_ORANI';

    -- Fonun daha önce hesaplanmış olan 'Yıllık Getirisi' ve 'Volatilitesini' (Toplam Riskini) risk sonuç tablosundan çekiyoruz
    SELECT YILLIK_GETIRI / 100, VOLATILITE
    INTO v_yillik_getiri, v_volatilite
    FROM TB_RISK_SONUC
    WHERE FON_KODU = p_fonkodu AND HESAPLAMA_TARIHI = p_tarih;

    -- Eğer fonun volatilitesi (riski) sıfırdan büyükse hesaplama yapıyoruz. Sıfıra bölme hatasını (divide by zero) engelliyoruz.
    IF NVL(v_volatilite, 0) > 0 THEN
        -- Sharpe Oranı Formülü: (Fonun Yıllık Getirisi - Risksiz Getiri) / Fonun Volatilitesi
        -- Yorum: Alınan her bir birim toplam riske karşılık fonun risksiz getirinin üzerinde ne kadar kazandırdığını gösterir.
        v_sharpe := (v_yillik_getiri - v_risksiz_getiri) / v_volatilite;
        
        UPDATE TB_RISK_SONUC
        SET SHARPE = v_sharpe
        WHERE FON_KODU = p_fonkodu AND HESAPLAMA_TARIHI = p_tarih;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        PR_LOG_HATA(p_fonkodu, 'PR_SHARPE_HESAPLA', SQLERRM);
END;

