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
    -- WITH bloğu kullanarak endeksin 1 yıl önceki ve bugünkü fiyatlarını sıraya diziyoruz (rn_asc ve rn_desc ile ilk ve son kayıtları buluyoruz)
    WITH EndeksFiyatlar AS (
        SELECT FIYAT,
               ROW_NUMBER() OVER (ORDER BY TARIH ASC) as rn_asc,   -- İlk fiyatı (1 yıl önceki) bulmak için
               ROW_NUMBER() OVER (ORDER BY TARIH DESC) as rn_desc  -- Son fiyatı (bugünkü) bulmak için
        FROM TB_ENDEKS_FIYAT
        WHERE ENDEKS_KODU = 'BIST100'
          AND TARIH BETWEEN v_baslangic_tarihi AND p_tarih
    )
    -- Endeks getirisi formülü: (Son Fiyat - İlk Fiyat) / İlk Fiyat
    SELECT ( (SELECT FIYAT FROM EndeksFiyatlar WHERE rn_desc = 1) - (SELECT FIYAT FROM EndeksFiyatlar WHERE rn_asc = 1) ) 
           / NULLIF((SELECT FIYAT FROM EndeksFiyatlar WHERE rn_asc = 1), 0)
    INTO v_endeks_getiri
    FROM DUAL;

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
/
