CREATE OR REPLACE PROCEDURE PR_ALPHA_HESAPLA(
    p_fonkodu IN VARCHAR2,
    p_tarih IN DATE
) AS
    v_risksiz_getiri NUMBER; 
    v_yillik_getiri NUMBER;
    v_beta NUMBER;
    v_endeks_getiri NUMBER;
    v_alpha NUMBER;
    v_baslangic_tarihi DATE;
    v_gecen_yil_tarih DATE;
    v_endeks_ilk_fiyat NUMBER;
    v_endeks_son_fiyat NUMBER;
BEGIN
    v_baslangic_tarihi := ADD_MONTHS(p_tarih, -12);

    -- 1. Sistem parametrelerinden Risksiz Getiri oranını (Örn: yıllık %42) çekip formüle uygun olması için yüze (0.42) bölüyoruz
    SELECT DEGER / 100 INTO v_risksiz_getiri 
    FROM TB_SISTEM_PARAMETRE 
    WHERE PARAMETRE_ADI = 'RISKSIZ_GETIRI_ORANI';

    -- 2. Fonun daha önceden hesaplanmış olan 'Yıllık Getirisi' ve 'Beta Katsayısını' (Piyasa Duyarlılığını) tablodan alıyoruz
    SELECT YILLIK_GETIRI / 100, BETA
    INTO v_yillik_getiri, v_beta
    FROM TB_RISK_SONUC
    WHERE FON_KODU = p_fonkodu AND HESAPLAMA_TARIHI = p_tarih;

    -- 3. BIST100 endeksinin son 1 yıllık getirisini hesaplıyoruz.
    -- Yıllık getiri hesaplamak için 1 yıl (12 ay) önceki güne veya ona en yakın ileri tarihteki ilk işlem gününe (fiyatın olduğu ilk güne) gidiyoruz.
    SELECT MIN(TARIH)
    INTO v_gecen_yil_tarih
    FROM TB_ENDEKS_FIYAT
    WHERE ENDEKS_KODU = 'BIST100'
    AND TARIH >= v_baslangic_tarihi;

    -- Endeksin parametre olarak gönderilen bugünkü kapanış fiyatını çekiyoruz.
    SELECT FIYAT INTO v_endeks_son_fiyat 
    FROM TB_ENDEKS_FIYAT
    WHERE ENDEKS_KODU = 'BIST100'
    AND TARIH = p_tarih;

    -- Endeksin bulduğumuz '1 yıl önceki' fiyatını çekiyoruz.
    SELECT FIYAT INTO v_endeks_ilk_fiyat 
    FROM TB_ENDEKS_FIYAT
    WHERE ENDEKS_KODU = 'BIST100'
    AND TARIH = v_gecen_yil_tarih;

    -- Endeks getirisi formülü: (Son Fiyat - İlk Fiyat) / İlk Fiyat
    v_endeks_getiri := (v_endeks_son_fiyat - v_endeks_ilk_fiyat) / NULLIF(v_endeks_ilk_fiyat, 0);

    -- 4. Alpha Hesaplanması ve Kaydedilmesi
    -- Eğer Beta değeri null değilse (hesaplanabilmişse) işlem yapılır
    IF v_beta IS NOT NULL THEN
        -- Alpha (Jensen's Alpha) Formülü: 
        -- Fonun Yıllık Getirisi - [Risksiz Getiri + Beta * (Endeks Getirisi - Risksiz Getiri)]
        -- Yorum: Alpha, fon yöneticisinin kendi becerisiyle (piyasa gidişatından bağımsız) fona sağladığı ekstra getiridir.
        v_alpha := (v_yillik_getiri - (v_risksiz_getiri + v_beta * (v_endeks_getiri - v_risksiz_getiri))) * 100;
        
        -- Bulunan Alpha değerini ilgili fon ve tarih için risk tablosunda güncelliyoruz
        UPDATE TB_RISK_SONUC
        SET ALPHA = v_alpha
        WHERE FON_KODU = p_fonkodu AND HESAPLAMA_TARIHI = p_tarih;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE_APPLICATION_ERROR(-20001, 'Alpha Hesaplarken Hata: ' || SQLERRM);
END;

