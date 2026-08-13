CREATE OR REPLACE PROCEDURE PR_FON_DURUM_GUNCELLE AS
    v_baslangic_tarihi DATE;
    v_hesaplama_tarihi DATE;
BEGIN
    -- Her zaman tablodaki en son fiyat tarihini (MAX) baz alıyoruz.
    SELECT MAX(TARIH) INTO v_hesaplama_tarihi FROM TB_FON_FIYAT;

    -- Referans tarihten tam 1 yıl öncesini buluyoruz.
    v_baslangic_tarihi := ADD_MONTHS(v_hesaplama_tarihi, -12);

    -- Önce tüm fonları varsayılan olarak AKTIF konuma getirelim.  
    UPDATE TB_FONLAR SET DURUM = 'AKTIF';

    -- 1. 1 yıllık geçmişi olmayan veya hiç verisi olmayan fonları PASIF yapalım
    -- Eğer bir fonun 1 yıl öncesinde (v_baslangic_tarihi) veya daha eski bir tarihte HİÇ kaydı yoksa pasif yap.
    UPDATE TB_FONLAR
    SET DURUM = 'PASIF'
    WHERE DURUM = 'AKTIF' AND FON_KODU NOT IN (
        SELECT FON_KODU 
        FROM TB_FON_FIYAT 
        WHERE TARIH <= v_baslangic_tarihi
    );

    -- 2. Son 1 yıl içinde fiyatı 0'a, eksiye düşen veya NULL olan fonları PASIF yapalım
    UPDATE TB_FONLAR 
    SET DURUM = 'PASIF'
    WHERE DURUM = 'AKTIF' AND FON_KODU IN (
        SELECT FON_KODU 
        FROM TB_FON_FIYAT 
        WHERE TARIH >= v_baslangic_tarihi 
          AND (BIRIM_FIYAT <= 0 OR BIRIM_FIYAT IS NULL)
    );

    -- 3. Hesaplama günü için fiyat verisi olmayan fonları PASIF yapalım.
    UPDATE TB_FONLAR 
    SET DURUM = 'PASIF'
    WHERE DURUM = 'AKTIF' AND FON_KODU NOT IN (
        SELECT FON_KODU 
        FROM TB_FON_FIYAT 
        WHERE TARIH = v_hesaplama_tarihi
    );

    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        PR_LOG_HATA('SISTEM', 'PR_FON_DURUM_GUNCELLE', SQLERRM);
END;
