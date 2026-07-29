CREATE OR REPLACE PROCEDURE PR_FON_DURUM_GUNCELLE AS
BEGIN
    -- 1. Önce tüm fonları varsayılan olarak AKTIF konuma getirelim
    UPDATE TB_FONLAR SET DURUM = 'AKTIF';

    -- 2. Yıl içinde fiyatı 0'a (veya eksiye) düşmüş YA DA 0'la başlayıp sonradan yükselmiş fonları PASIF yapalım
    UPDATE TB_FONLAR 
    SET DURUM = 'PASIF'
    WHERE FON_KODU IN (
        SELECT DISTINCT FON_KODU 
        FROM TB_FON_FIYAT 
        WHERE BIRIM_FIYAT <= 0
    );

    -- 3. Günlük getirilerinde 1 günde %100'den fazla artış (NMG gibi) VEYA %50'den fazla azalış olan fonları PASIF yapalım
    UPDATE TB_FONLAR 
    SET DURUM = 'PASIF'
    WHERE FON_KODU IN (
        SELECT DISTINCT FON_KODU 
        FROM (
            SELECT FON_KODU,
                   (BIRIM_FIYAT - LAG(BIRIM_FIYAT) OVER (PARTITION BY FON_KODU ORDER BY TARIH)) / 
                   NULLIF(LAG(BIRIM_FIYAT) OVER (PARTITION BY FON_KODU ORDER BY TARIH), 0) AS GUN_GETIRI
            FROM TB_FON_FIYAT
        )
        WHERE GUN_GETIRI > 1.0 OR GUN_GETIRI < -0.50
    );

    COMMIT;
END;
/
