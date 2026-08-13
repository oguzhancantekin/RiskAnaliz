CREATE OR REPLACE PROCEDURE PR_SAVE_FON_FIYAT(
    p_fonkodu IN VARCHAR2,
    p_tarih IN DATE,
    p_fiyat IN NUMBER
) AS
BEGIN
    -- Günlük birim fiyatı MERGE et
    -- Sadece fiyat değişmişse UPDATE yap (Fiyat aynıysa veritabanına yazma yapma)
    MERGE INTO TB_FON_FIYAT f
    USING (SELECT p_fonkodu AS FON_KODU, p_tarih AS TARIH, p_fiyat AS BIRIM_FIYAT FROM DUAL) src
    ON (f.FON_KODU = src.FON_KODU AND f.TARIH = src.TARIH)
    WHEN MATCHED THEN
        UPDATE SET f.BIRIM_FIYAT = src.BIRIM_FIYAT
        WHERE NVL(f.BIRIM_FIYAT, -99999) != NVL(src.BIRIM_FIYAT, -99999) -- fiyat aynı mı kontrolü, biri null olunca sorun çıkmasın diye nvl ile kontrol ediyoruz.
    WHEN NOT MATCHED THEN
        INSERT (FON_KODU, TARIH, BIRIM_FIYAT)
        VALUES (src.FON_KODU, src.TARIH, src.BIRIM_FIYAT);
END;

