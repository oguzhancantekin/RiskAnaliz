CREATE OR REPLACE PROCEDURE PR_SAVE_FON_FIYAT(
    p_fonkodu IN VARCHAR2,
    p_tarih IN DATE,
    p_fiyat IN NUMBER
) AS
BEGIN
    -- Eğer fon künye tablosunda (TB_FONLAR) bu fon kodu henüz yoksa,
    -- Foreign Key (FK_FON_FIYAT_FON) hatası vermemesi için taslak olarak ekle
    MERGE INTO TB_FONLAR f
    USING (SELECT p_fonkodu AS FON_KODU FROM DUAL) src
    ON (f.FON_KODU = src.FON_KODU)
    WHEN NOT MATCHED THEN
        INSERT (FON_KODU, FON_ADI) VALUES (src.FON_KODU, 'TANIMSIZ - ' || src.FON_KODU);

    -- Günlük birim fiyatı kaydet veya güncelle
    MERGE INTO TB_FON_FIYAT f
    USING (SELECT p_fonkodu AS FON_KODU, p_tarih AS TARIH, p_fiyat AS BIRIM_FIYAT FROM DUAL) src
    ON (f.FON_KODU = src.FON_KODU AND f.TARIH = src.TARIH)
    WHEN MATCHED THEN
        UPDATE SET f.BIRIM_FIYAT = src.BIRIM_FIYAT
    WHEN NOT MATCHED THEN
        INSERT (FON_KODU, TARIH, BIRIM_FIYAT)
        VALUES (src.FON_KODU, src.TARIH, src.BIRIM_FIYAT);
END;

